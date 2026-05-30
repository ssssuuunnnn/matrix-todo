import React, { useState, useEffect, useRef } from 'react';
import type { Todo, QuadrantId } from '../types';
import { QUADRANTS } from '../types';
import styles from './TodoModal.module.css';

interface Props {
  initialQuadrant?: QuadrantId;
  editingTodo?: Todo | null;
  onSave: (data: { title: string; note: string; deadline?: string; quadrant: QuadrantId }) => void;
  onClose: () => void;
}

export const TodoModal: React.FC<Props> = ({ initialQuadrant, editingTodo, onSave, onClose }) => {
  const [title, setTitle] = useState(editingTodo?.title ?? '');
  const [note, setNote] = useState(editingTodo?.note ?? '');
  const [deadline, setDeadline] = useState(editingTodo?.deadline ?? '');
  const [quadrant, setQuadrant] = useState<QuadrantId>(
    editingTodo?.quadrant ?? initialQuadrant ?? 'q4'
  );
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave({ title: trimmed, note: note.trim(), deadline: deadline || undefined, quadrant });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{editingTodo ? '編輯任務' : '新增任務'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="關閉">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="todo-title">
              任務名稱 <span className={styles.required}>*</span>
            </label>
            <input
              ref={titleRef}
              id="todo-title"
              type="text"
              className={styles.input}
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, 50))}
              placeholder="輸入任務名稱..."
              maxLength={50}
              required
            />
            <span className={styles.charCount}>{title.length} / 50</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="todo-note">
              備註描述 <span className={styles.optional}>（選填）</span>
            </label>
            <textarea
              id="todo-note"
              className={styles.textarea}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="補充說明..."
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="todo-deadline">
              截止日期 <span className={styles.optional}>（選填）</span>
            </label>
            <input
              id="todo-deadline"
              type="date"
              className={styles.input}
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>分配象限</label>
            <div className={styles.quadrantGrid}>
              {QUADRANTS.map(q => (
                <label
                  key={q.id}
                  className={`${styles.quadrantOption} ${quadrant === q.id ? styles.selected : ''}`}
                  style={
                    quadrant === q.id
                      ? { borderColor: q.color, backgroundColor: q.bgColor }
                      : {}
                  }
                >
                  <input
                    type="radio"
                    name="quadrant"
                    value={q.id}
                    checked={quadrant === q.id}
                    onChange={() => setQuadrant(q.id)}
                  />
                  <span
                    className={styles.quadrantDot}
                    style={{ backgroundColor: q.color }}
                  />
                  <span className={styles.quadrantLabel} style={quadrant === q.id ? { color: q.color } : {}}>
                    {q.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              取消
            </button>
            <button type="submit" className={styles.saveBtn} disabled={!title.trim()}>
              {editingTodo ? '儲存變更' : '新增任務'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
