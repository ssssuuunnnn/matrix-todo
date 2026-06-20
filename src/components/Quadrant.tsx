import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Todo, QuadrantConfig, QuadrantId } from '../types';
import { TodoCard } from './TodoCard';
import styles from './Quadrant.module.css';

interface Props {
  config: QuadrantConfig;
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onAddClick: (quadrantId: string) => void;
  onMove: (id: string, quadrant: QuadrantId) => void;
}

export const Quadrant: React.FC<Props> = ({
  config,
  todos,
  onToggle,
  onDelete,
  onEdit,
  onAddClick,
  onMove,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: config.id });

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div
      className={`${styles.quadrant} ${isOver ? styles.isOver : ''}`}
      style={{
        backgroundColor: config.bgColor,
        borderColor: isOver ? config.color : config.borderColor,
      }}
    >
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span
            className={styles.badge}
            style={{ backgroundColor: config.badgeColor, color: config.color }}
          >
            {config.action}
          </span>
          <div className={styles.labels}>
            <span className={styles.title} style={{ color: config.color }}>
              {config.label}
            </span>
            <span className={styles.subtitle}>{config.subtitle}</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.count} style={{ color: config.color }}>
            {activeTodos.length}
          </span>
          <button
            className={styles.addBtn}
            style={{ color: config.color, borderColor: config.color }}
            onClick={() => onAddClick(config.id)}
            aria-label={`在「${config.label}」新增任務`}
          >
            +
          </button>
        </div>
      </div>

      <div ref={setNodeRef} className={styles.dropZone}>
        {todos.length === 0 && (
          <div className={styles.emptyHint}>
            <span>拖拽任務到此處，或點擊「+」新增</span>
          </div>
        )}
        <div className={styles.todoList}>
          {activeTodos.map(todo => (
            <TodoCard
              key={todo.id}
              todo={todo}
              quadrant={config}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              onMove={onMove}
            />
          ))}
        </div>
        {completedTodos.length > 0 && (
          <div className={styles.completedSection}>
            <div className={styles.completedDivider}>已完成 ({completedTodos.length})</div>
            <div className={styles.todoList}>
              {completedTodos.map(todo => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  quadrant={config}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onMove={onMove}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
