import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useTodos } from './hooks/useTodos';
import { useAuth } from './hooks/useAuth';
import { Quadrant } from './components/Quadrant';
import { ListView } from './components/ListView';
import { CalendarView } from './components/CalendarView';
import { TodoCard } from './components/TodoCard';
import { TodoModal } from './components/TodoModal';
import { AuthBar } from './components/AuthBar';
import { QUADRANTS } from './types';
import type { Todo, QuadrantId } from './types';
import styles from './App.module.css';

type ViewMode = 'matrix' | 'list' | 'calendar';

export default function App() {
  const { user, loading, signIn, signOut } = useAuth();
  const { todos, addTodo, updateTodo, deleteTodo, toggleComplete, moveTodo } = useTodos(user);
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalQuadrant, setModalQuadrant] = useState<QuadrantId>('q4');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleAddClick = useCallback((quadrantId: string) => {
    setEditingTodo(null);
    setModalQuadrant(quadrantId as QuadrantId);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((todo: Todo) => {
    setEditingTodo(todo);
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(
    (data: { title: string; note: string; deadline?: string; quadrant: QuadrantId }) => {
      if (editingTodo) {
        updateTodo(editingTodo.id, data);
      } else {
        addTodo(data);
      }
    },
    [editingTodo, addTodo, updateTodo]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const todo = todos.find(t => t.id === event.active.id);
    setActiveTodo(todo ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTodo(null);
    const { active, over } = event;
    if (!over) return;
    const targetQuadrant = over.id as QuadrantId;
    const todo = todos.find(t => t.id === active.id);
    if (todo && todo.quadrant !== targetQuadrant) {
      moveTodo(todo.id, targetQuadrant);
    }
  };

  const activeQuadrant = activeTodo
    ? QUADRANTS.find(q => q.id === activeTodo.quadrant)!
    : null;

  const totalActive = todos.filter(t => !t.completed).length;

  return (
    <div className={styles.app}>
      <AuthBar user={user} loading={loading} onSignIn={signIn} onSignOut={signOut} />
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.brand}>
            <span className={styles.logo}>⊞</span>
            <div>
              <h1 className={styles.appTitle}>今天該面對什麼</h1>
              <p className={styles.appSubtitle}>艾森豪決策矩陣</p>
            </div>
          </div>
          <div className={styles.headerRight}>
            {totalActive > 0 && (
              <span className={styles.totalBadge}>{totalActive} 項待辦</span>
            )}
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewBtn} ${viewMode === 'matrix' ? styles.viewBtnActive : ''}`}
                onClick={() => setViewMode('matrix')}
                title="矩陣檢視"
              >
                ⊞ 矩陣
              </button>
              <button
                className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
                onClick={() => setViewMode('list')}
                title="清單檢視"
              >
                ☰ 清單
              </button>
              <button
                className={`${styles.viewBtn} ${viewMode === 'calendar' ? styles.viewBtnActive : ''}`}
                onClick={() => setViewMode('calendar')}
                title="日曆檢視"
              >
                📅 日曆
              </button>
            </div>
            <button
              className={styles.addBtn}
              onClick={() => handleAddClick('q4')}
              aria-label="新增任務"
            >
              <span>+</span> 新增任務
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {viewMode === 'list' ? (
          <ListView
            todos={todos}
            onToggle={toggleComplete}
            onDelete={deleteTodo}
            onEdit={handleEdit}
          />
        ) : viewMode === 'calendar' ? (
          <CalendarView
            todos={todos}
            onToggle={toggleComplete}
            onDelete={deleteTodo}
            onEdit={handleEdit}
          />
        ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className={styles.axisLabels}>
            <div className={styles.axisY}>
              <span className={styles.axisArrow}>↑</span>
              <span className={styles.axisText}>重要程度</span>
              <span className={styles.axisArrow}>↓</span>
            </div>
            <div className={styles.matrixWrapper}>
              <div className={styles.axisX}>
                <span className={styles.axisArrow}>←</span>
                <span className={styles.axisText}>緊急程度</span>
                <span className={styles.axisArrow}>→</span>
              </div>
              <div className={styles.matrix}>
                {QUADRANTS.map(q => (
                  <Quadrant
                    key={q.id}
                    config={q}
                    todos={todos.filter(t => t.quadrant === q.id)}
                    onToggle={toggleComplete}
                    onDelete={deleteTodo}
                    onEdit={handleEdit}
                    onAddClick={handleAddClick}
                  />
                ))}
              </div>
            </div>
          </div>

          <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
            {activeTodo && activeQuadrant ? (
              <div style={{ transform: 'rotate(2deg)', opacity: 0.95 }}>
                <TodoCard
                  todo={activeTodo}
                  quadrant={activeQuadrant}
                  onToggle={() => {}}
                  onDelete={() => {}}
                  onEdit={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        )}
      </main>

      {modalOpen && (
        <TodoModal
          initialQuadrant={modalQuadrant}
          editingTodo={editingTodo}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setEditingTodo(null);
          }}
        />
      )}
    </div>
  );
}
