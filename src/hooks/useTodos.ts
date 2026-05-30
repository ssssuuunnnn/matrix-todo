import { useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Todo, QuadrantId } from '../types';

const STORAGE_KEY = 'matrix-todo-v1';

type Action =
  | { type: 'ADD'; payload: Omit<Todo, 'id' | 'createdAt' | 'completed'> }
  | { type: 'UPDATE'; payload: { id: string; changes: Partial<Omit<Todo, 'id' | 'createdAt'>> } }
  | { type: 'DELETE'; payload: string }
  | { type: 'TOGGLE_COMPLETE'; payload: string }
  | { type: 'MOVE'; payload: { id: string; quadrant: QuadrantId } };

export function reducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case 'ADD':
      return [
        ...state,
        { id: uuidv4(), createdAt: Date.now(), completed: false, ...action.payload },
      ];
    case 'UPDATE':
      return state.map(t => (t.id === action.payload.id ? { ...t, ...action.payload.changes } : t));
    case 'DELETE':
      return state.filter(t => t.id !== action.payload);
    case 'TOGGLE_COMPLETE':
      return state.map(t => (t.id === action.payload ? { ...t, completed: !t.completed } : t));
    case 'MOVE':
      return state.map(t =>
        t.id === action.payload.id ? { ...t, quadrant: action.payload.quadrant } : t
      );
    default:
      return state;
  }
}

function loadFromStorage(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Todo[]) : [];
  } catch {
    return [];
  }
}

export function useTodos() {
  const [todos, dispatch] = useReducer(reducer, undefined, loadFromStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  return {
    todos,
    addTodo: (payload: Omit<Todo, 'id' | 'createdAt' | 'completed'>) =>
      dispatch({ type: 'ADD', payload }),
    updateTodo: (id: string, changes: Partial<Omit<Todo, 'id' | 'createdAt'>>) =>
      dispatch({ type: 'UPDATE', payload: { id, changes } }),
    deleteTodo: (id: string) => dispatch({ type: 'DELETE', payload: id }),
    toggleComplete: (id: string) => dispatch({ type: 'TOGGLE_COMPLETE', payload: id }),
    moveTodo: (id: string, quadrant: QuadrantId) =>
      dispatch({ type: 'MOVE', payload: { id, quadrant } }),
  };
}
