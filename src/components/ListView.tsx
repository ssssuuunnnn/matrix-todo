import React, { useState } from 'react';
import type { Todo, QuadrantConfig } from '../types';
import { QUADRANTS } from '../types';
import { TodoCard } from './TodoCard';
import styles from './ListView.module.css';

interface Props {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

type Filter = 'all' | 'active' | 'completed';

const QUADRANT_ORDER: Record<string, number> = { q1: 0, q2: 1, q3: 2, q4: 3 };

export const ListView: React.FC<Props> = ({ todos, onToggle, onDelete, onEdit }) => {
  const [filter, setFilter] = useState<Filter>('active');

  const filtered = todos
    .filter(t => {
      if (filter === 'active') return !t.completed;
      if (filter === 'completed') return t.completed;
      return true;
    })
    .sort((a, b) => QUADRANT_ORDER[a.quadrant] - QUADRANT_ORDER[b.quadrant]);

  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {(['active', 'all', 'completed'] as Filter[]).map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'active' && `待辦 (${activeCount})`}
              {f === 'all' && `全部 (${todos.length})`}
              {f === 'completed' && `已完成 (${completedCount})`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🎉</span>
          <p>{filter === 'active' ? '沒有待辦事項！' : '這裡空空的'}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {QUADRANTS.map(q => {
            const group = filtered.filter(t => t.quadrant === q.id);
            if (group.length === 0) return null;
            return (
              <QuadrantGroup
                key={q.id}
                config={q}
                todos={group}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

interface GroupProps {
  config: QuadrantConfig;
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

const QuadrantGroup: React.FC<GroupProps> = ({ config, todos, onToggle, onDelete, onEdit }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.group}>
      <button
        className={styles.groupHeader}
        style={{ borderLeftColor: config.color }}
        onClick={() => setCollapsed(c => !c)}
      >
        <span
          className={styles.groupDot}
          style={{ backgroundColor: config.color }}
        />
        <span className={styles.groupLabel} style={{ color: config.color }}>
          {config.label}
        </span>
        <span className={styles.groupBadge} style={{ backgroundColor: config.badgeColor, color: config.color }}>
          {config.action}
        </span>
        <span className={styles.groupCount}>{todos.length}</span>
        <span className={styles.collapseIcon}>{collapsed ? '▶' : '▼'}</span>
      </button>

      {!collapsed && (
        <div className={styles.groupItems}>
          {todos.map(todo => (
            <TodoCard
              key={todo.id}
              todo={todo}
              quadrant={config}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};
