import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Todo, QuadrantConfig } from '../types';
import styles from './TodoCard.module.css';

function formatDeadline(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return '今天到期';
  if (diff === 1) return '明天到期';
  if (diff === -1) return '昨天已過期';
  if (diff < 0) return `已逾期 ${Math.abs(diff)} 天`;
  if (diff <= 7) return `${diff} 天後到期`;
  return date.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }) + ' 到期';
}

function getDaysUntil(dateStr: string): number {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86400000);
}

interface Props {
  todo: Todo;
  quadrant: QuadrantConfig;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

export const TodoCard: React.FC<Props> = ({ todo, quadrant, onToggle, onDelete, onEdit }) => {
  const [showActions, setShowActions] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: todo.id,
    data: { todo },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  const daysUntil = todo.deadline && !todo.completed ? getDaysUntil(todo.deadline) : null;
  const urgency = daysUntil === null ? 'none'
    : daysUntil < 0 ? 'overdue'
    : daysUntil <= 3 ? 'soon'
    : 'normal';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        styles.card,
        todo.completed ? styles.completed : '',
        urgency === 'overdue' ? styles.urgencyOverdue : '',
        urgency === 'soon' ? styles.urgencySoon : '',
      ].join(' ')}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={styles.dragHandle} {...listeners} {...attributes} title="拖拽移動">
        <span className={styles.gripIcon}>⠿</span>
      </div>

      <button
        className={styles.checkbox}
        onClick={() => onToggle(todo.id)}
        style={{ borderColor: quadrant.color, color: quadrant.color }}
        aria-label={todo.completed ? '標記為未完成' : '標記為完成'}
      >
        {todo.completed && <span className={styles.checkmark}>✓</span>}
      </button>

      <div className={styles.content}>
        <span className={styles.title}>{todo.title}</span>
        {todo.note && <span className={styles.note}>{todo.note}</span>}
        {todo.deadline && (
          <span
            className={[
              styles.deadline,
              urgency === 'overdue' ? styles.overdue : '',
              urgency === 'soon' ? styles.soon : '',
            ].join(' ')}
          >
            {urgency === 'overdue' && <span className={styles.urgencyBadge}>⚠ 逾期</span>}
            {urgency === 'soon' && <span className={styles.urgencyBadge}>🔔 快到期</span>}
            {formatDeadline(todo.deadline)}
          </span>
        )}
      </div>

      {showActions && (
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={() => onEdit(todo)}
            title="編輯"
            aria-label="編輯任務"
          >
            ✎
          </button>
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => onDelete(todo.id)}
            title="刪除"
            aria-label="刪除任務"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
