import { describe, it, expect } from 'vitest';
import { reducer } from '../useTodos';
import type { Todo } from '../../types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'todo-1',
    title: '測試任務',
    note: '',
    quadrant: 'q1',
    completed: false,
    createdAt: 1000,
    ...overrides,
  };
}

const EMPTY: Todo[] = [];
const BASE_STATE: Todo[] = [
  makeTodo({ id: 'todo-1', title: '任務一', quadrant: 'q1' }),
  makeTodo({ id: 'todo-2', title: '任務二', quadrant: 'q2', completed: true }),
];

// ── ADD ──────────────────────────────────────────────────────────────────────

describe('ADD', () => {
  it('空 state 時新增一筆 todo', () => {
    const result = reducer(EMPTY, {
      type: 'ADD',
      payload: { title: '新任務', note: '', quadrant: 'q1' },
    });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('新任務');
    expect(result[0].quadrant).toBe('q1');
  });

  it('新增的 todo 預設 completed 為 false', () => {
    const result = reducer(EMPTY, {
      type: 'ADD',
      payload: { title: '新任務', note: '', quadrant: 'q2' },
    });

    expect(result[0].completed).toBe(false);
  });

  it('新增的 todo 會有自動產生的 id 與 createdAt', () => {
    const result = reducer(EMPTY, {
      type: 'ADD',
      payload: { title: '新任務', note: '', quadrant: 'q3' },
    });

    expect(result[0].id).toBeTruthy();
    expect(typeof result[0].createdAt).toBe('number');
    expect(result[0].createdAt).toBeGreaterThan(0);
  });

  it('每次新增的 id 不重複', () => {
    const payload = { title: '任務', note: '', quadrant: 'q1' } as const;
    const s1 = reducer(EMPTY, { type: 'ADD', payload });
    const s2 = reducer(s1, { type: 'ADD', payload });

    expect(s2[0].id).not.toBe(s2[1].id);
  });

  it('新增後原有 todos 不受影響', () => {
    const result = reducer(BASE_STATE, {
      type: 'ADD',
      payload: { title: '第三筆', note: '', quadrant: 'q4' },
    });

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(BASE_STATE[0]);
    expect(result[1]).toEqual(BASE_STATE[1]);
  });

  it('可新增帶 deadline 的 todo', () => {
    const result = reducer(EMPTY, {
      type: 'ADD',
      payload: { title: '有期限', note: '', quadrant: 'q1', deadline: '2025-12-31' },
    });

    expect(result[0].deadline).toBe('2025-12-31');
  });
});

// ── UPDATE ───────────────────────────────────────────────────────────────────

describe('UPDATE', () => {
  it('更新指定 id 的 title', () => {
    const result = reducer(BASE_STATE, {
      type: 'UPDATE',
      payload: { id: 'todo-1', changes: { title: '已更新標題' } },
    });

    expect(result.find(t => t.id === 'todo-1')!.title).toBe('已更新標題');
  });

  it('更新指定 id 的 note 與 deadline', () => {
    const result = reducer(BASE_STATE, {
      type: 'UPDATE',
      payload: { id: 'todo-1', changes: { note: '備註', deadline: '2025-06-01' } },
    });

    const updated = result.find(t => t.id === 'todo-1')!;
    expect(updated.note).toBe('備註');
    expect(updated.deadline).toBe('2025-06-01');
  });

  it('更新不存在的 id 時 state 不變', () => {
    const result = reducer(BASE_STATE, {
      type: 'UPDATE',
      payload: { id: 'not-exist', changes: { title: '不存在' } },
    });

    expect(result).toEqual(BASE_STATE);
  });

  it('只更新目標 todo，其他 todo 不受影響', () => {
    const result = reducer(BASE_STATE, {
      type: 'UPDATE',
      payload: { id: 'todo-1', changes: { title: '只改這筆' } },
    });

    expect(result.find(t => t.id === 'todo-2')).toEqual(BASE_STATE[1]);
  });
});

// ── DELETE ───────────────────────────────────────────────────────────────────

describe('DELETE', () => {
  it('刪除指定 id 的 todo', () => {
    const result = reducer(BASE_STATE, { type: 'DELETE', payload: 'todo-1' });

    expect(result).toHaveLength(1);
    expect(result.find(t => t.id === 'todo-1')).toBeUndefined();
  });

  it('刪除後其他 todo 保持不變', () => {
    const result = reducer(BASE_STATE, { type: 'DELETE', payload: 'todo-1' });

    expect(result[0]).toEqual(BASE_STATE[1]);
  });

  it('刪除不存在的 id 時 state 不變', () => {
    const result = reducer(BASE_STATE, { type: 'DELETE', payload: 'not-exist' });

    expect(result).toEqual(BASE_STATE);
  });

  it('刪除最後一筆後回傳空陣列', () => {
    const single = [makeTodo({ id: 'only-one' })];
    const result = reducer(single, { type: 'DELETE', payload: 'only-one' });

    expect(result).toHaveLength(0);
  });
});

// ── TOGGLE_COMPLETE ───────────────────────────────────────────────────────────

describe('TOGGLE_COMPLETE', () => {
  it('false → true', () => {
    const result = reducer(BASE_STATE, { type: 'TOGGLE_COMPLETE', payload: 'todo-1' });

    expect(result.find(t => t.id === 'todo-1')!.completed).toBe(true);
  });

  it('true → false', () => {
    const result = reducer(BASE_STATE, { type: 'TOGGLE_COMPLETE', payload: 'todo-2' });

    expect(result.find(t => t.id === 'todo-2')!.completed).toBe(false);
  });

  it('連續 toggle 兩次後回到原始值', () => {
    const s1 = reducer(BASE_STATE, { type: 'TOGGLE_COMPLETE', payload: 'todo-1' });
    const s2 = reducer(s1, { type: 'TOGGLE_COMPLETE', payload: 'todo-1' });

    expect(s2.find(t => t.id === 'todo-1')!.completed).toBe(BASE_STATE[0].completed);
  });

  it('toggle 不存在的 id 時 state 不變', () => {
    const result = reducer(BASE_STATE, { type: 'TOGGLE_COMPLETE', payload: 'not-exist' });

    expect(result).toEqual(BASE_STATE);
  });

  it('只改目標 todo，其他 todo 不受影響', () => {
    const result = reducer(BASE_STATE, { type: 'TOGGLE_COMPLETE', payload: 'todo-1' });

    expect(result.find(t => t.id === 'todo-2')).toEqual(BASE_STATE[1]);
  });
});

// ── MOVE ─────────────────────────────────────────────────────────────────────

describe('MOVE', () => {
  it('將 todo 移動到指定象限', () => {
    const result = reducer(BASE_STATE, {
      type: 'MOVE',
      payload: { id: 'todo-1', quadrant: 'q3' },
    });

    expect(result.find(t => t.id === 'todo-1')!.quadrant).toBe('q3');
  });

  it('移動到相同象限後 state 不變（內容一致）', () => {
    const result = reducer(BASE_STATE, {
      type: 'MOVE',
      payload: { id: 'todo-1', quadrant: 'q1' },
    });

    expect(result.find(t => t.id === 'todo-1')!.quadrant).toBe('q1');
  });

  it('移動不存在的 id 時 state 不變', () => {
    const result = reducer(BASE_STATE, {
      type: 'MOVE',
      payload: { id: 'not-exist', quadrant: 'q4' },
    });

    expect(result).toEqual(BASE_STATE);
  });

  it('只移動目標 todo，其他 todo 不受影響', () => {
    const result = reducer(BASE_STATE, {
      type: 'MOVE',
      payload: { id: 'todo-1', quadrant: 'q4' },
    });

    expect(result.find(t => t.id === 'todo-2')).toEqual(BASE_STATE[1]);
  });

  it('可以移動到四個象限的任一個', () => {
    const quadrants = ['q1', 'q2', 'q3', 'q4'] as const;
    for (const quadrant of quadrants) {
      const result = reducer(BASE_STATE, {
        type: 'MOVE',
        payload: { id: 'todo-1', quadrant },
      });
      expect(result.find(t => t.id === 'todo-1')!.quadrant).toBe(quadrant);
    }
  });
});

// ── Immutability ──────────────────────────────────────────────────────────────

describe('Immutability（不可變性）', () => {
  it('ADD 不修改原始 state 陣列', () => {
    const original = [...BASE_STATE];
    reducer(BASE_STATE, {
      type: 'ADD',
      payload: { title: 'X', note: '', quadrant: 'q1' },
    });
    expect(BASE_STATE).toEqual(original);
  });

  it('UPDATE 不修改原始 todo 物件', () => {
    const originalTitle = BASE_STATE[0].title;
    reducer(BASE_STATE, {
      type: 'UPDATE',
      payload: { id: 'todo-1', changes: { title: '新標題' } },
    });
    expect(BASE_STATE[0].title).toBe(originalTitle);
  });

  it('DELETE 不修改原始 state 陣列', () => {
    const originalLength = BASE_STATE.length;
    reducer(BASE_STATE, { type: 'DELETE', payload: 'todo-1' });
    expect(BASE_STATE).toHaveLength(originalLength);
  });
});
