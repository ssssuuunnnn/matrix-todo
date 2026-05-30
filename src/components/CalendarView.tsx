import React, { useState } from 'react';
import type { Todo, QuadrantConfig } from '../types';
import { QUADRANTS } from '../types';
import styles from './CalendarView.module.css';

interface Props {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const QUADRANT_MAP = Object.fromEntries(QUADRANTS.map(q => [q.id, q])) as Record<string, QuadrantConfig>;

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];
  // leading empty cells
  for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  // trailing empty cells to fill last week
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

export const CalendarView: React.FC<Props> = ({ todos, onToggle, onDelete, onEdit }) => {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { year, month } = current;
  const days = getCalendarDays(year, month);

  const todosWithDeadline = todos.filter(t => t.deadline);
  const todosNoDeadline = todos.filter(t => !t.deadline && !t.completed);

  function getTodosForDay(date: Date) {
    return todosWithDeadline.filter(t => {
      const d = new Date(t.deadline! + 'T00:00:00');
      return isSameDay(d, date);
    });
  }

  function getDayUrgency(date: Date): 'overdue' | 'today' | 'normal' {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const t = new Date(today);
    t.setHours(0, 0, 0, 0);
    if (isSameDay(d, t)) return 'today';
    if (d < t) return 'overdue';
    return 'normal';
  }

  const selectedDayTodos = selectedDate ? getTodosForDay(selectedDate) : [];

  const prevMonth = () => setCurrent(c => {
    const m = c.month === 0 ? 11 : c.month - 1;
    const y = c.month === 0 ? c.year - 1 : c.year;
    return { year: y, month: m };
  });

  const nextMonth = () => setCurrent(c => {
    const m = c.month === 11 ? 0 : c.month + 1;
    const y = c.month === 11 ? c.year + 1 : c.year;
    return { year: y, month: m };
  });

  return (
    <div className={styles.container}>
      <div className={styles.calendarPanel}>
        {/* Month navigation */}
        <div className={styles.monthNav}>
          <button className={styles.navBtn} onClick={prevMonth}>‹</button>
          <h2 className={styles.monthTitle}>
            {year} 年 {month + 1} 月
          </h2>
          <button className={styles.navBtn} onClick={nextMonth}>›</button>
          <button
            className={styles.todayBtn}
            onClick={() => {
              setCurrent({ year: today.getFullYear(), month: today.getMonth() });
              setSelectedDate(today);
            }}
          >
            今天
          </button>
        </div>

        {/* Weekday headers */}
        <div className={styles.grid}>
          {WEEKDAYS.map(w => (
            <div key={w} className={styles.weekdayHeader}>{w}</div>
          ))}

          {/* Day cells */}
          {days.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className={styles.emptyCell} />;
            const dayTodos = getTodosForDay(date);
            const urgency = getDayUrgency(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const hasOverdue = dayTodos.some(t => !t.completed && urgency === 'overdue');
            const hasTodos = dayTodos.length > 0;

            return (
              <div
                key={date.toISOString()}
                className={[
                  styles.dayCell,
                  urgency === 'today' ? styles.today : '',
                  urgency === 'overdue' && hasTodos ? styles.overdueDay : '',
                  isSelected ? styles.selected : '',
                  hasTodos ? styles.hasTodos : '',
                ].join(' ')}
                onClick={() => setSelectedDate(isSelected ? null : date)}
              >
                <span className={styles.dayNumber}>{date.getDate()}</span>
                <div className={styles.dotRow}>
                  {dayTodos.slice(0, 4).map(t => (
                    <span
                      key={t.id}
                      className={`${styles.dot} ${t.completed ? styles.dotCompleted : ''}`}
                      style={{ backgroundColor: t.completed ? '#d1d5db' : QUADRANT_MAP[t.quadrant]?.color }}
                      title={t.title}
                    />
                  ))}
                  {dayTodos.length > 4 && (
                    <span className={styles.dotMore}>+{dayTodos.length - 4}</span>
                  )}
                </div>
                {hasOverdue && <span className={styles.overdueFlag}>⚠</span>}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className={styles.legend}>
          {QUADRANTS.map(q => (
            <div key={q.id} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: q.color }} />
              <span className={styles.legendLabel}>{q.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Side panel */}
      <div className={styles.sidePanel}>
        {selectedDate ? (
          <div className={styles.dayDetail}>
            <h3 className={styles.dayDetailTitle}>
              {selectedDate.getMonth() + 1} 月 {selectedDate.getDate()} 日
              {getDayUrgency(selectedDate) === 'today' && <span className={styles.todayTag}>今天</span>}
            </h3>
            {selectedDayTodos.length === 0 ? (
              <p className={styles.noTask}>這天沒有任務</p>
            ) : (
              <div className={styles.taskList}>
                {selectedDayTodos.map(t => {
                  const q = QUADRANT_MAP[t.quadrant];
                  return (
                    <div
                      key={t.id}
                      className={`${styles.taskItem} ${t.completed ? styles.taskCompleted : ''}`}
                    >
                      <div className={styles.taskLeft}>
                        <button
                          className={styles.taskCheck}
                          style={{ borderColor: q.color, color: q.color }}
                          onClick={() => onToggle(t.id)}
                        >
                          {t.completed && '✓'}
                        </button>
                        <div className={styles.taskInfo}>
                          <span className={styles.taskTitle}>{t.title}</span>
                          <span
                            className={styles.taskBadge}
                            style={{ backgroundColor: q.badgeColor, color: q.color }}
                          >
                            {q.label}
                          </span>
                        </div>
                      </div>
                      <div className={styles.taskActions}>
                        <button className={styles.actionBtn} onClick={() => onEdit(t)}>✎</button>
                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => onDelete(t.id)}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.sidePlaceholder}>
            <span>點選日期查看任務</span>
          </div>
        )}

        {/* No deadline todos */}
        {todosNoDeadline.length > 0 && (
          <div className={styles.noDeadlineSection}>
            <h3 className={styles.noDeadlineTitle}>📌 尚未設定截止日</h3>
            <div className={styles.taskList}>
              {todosNoDeadline.map(t => {
                const q = QUADRANT_MAP[t.quadrant];
                return (
                  <div key={t.id} className={styles.taskItem}>
                    <div className={styles.taskLeft}>
                      <button
                        className={styles.taskCheck}
                        style={{ borderColor: q.color, color: q.color }}
                        onClick={() => onToggle(t.id)}
                      />
                      <div className={styles.taskInfo}>
                        <span className={styles.taskTitle}>{t.title}</span>
                        <span
                          className={styles.taskBadge}
                          style={{ backgroundColor: q.badgeColor, color: q.color }}
                        >
                          {q.label}
                        </span>
                      </div>
                    </div>
                    <div className={styles.taskActions}>
                      <button className={styles.actionBtn} onClick={() => onEdit(t)}>✎</button>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => onDelete(t.id)}>✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
