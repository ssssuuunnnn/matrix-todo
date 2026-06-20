import { useReducer, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Todo, QuadrantId } from '../types';
import type { User } from 'firebase/auth';

const STORAGE_KEY = 'matrix-todo-v1';

type Action =
  | { type: 'ADD'; payload: Omit<Todo, 'id' | 'createdAt' | 'completed'> }
  | { type: 'UPDATE'; payload: { id: string; changes: Partial<Omit<Todo, 'id' | 'createdAt'>> } }
  | { type: 'DELETE'; payload: string }
  | { type: 'TOGGLE_COMPLETE'; payload: string }
  | { type: 'MOVE'; payload: { id: string; quadrant: QuadrantId } }
  | { type: 'SET_ALL'; payload: Todo[] };

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
    case 'SET_ALL':
      return action.payload;
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

function todosRef(uid: string) {
  return collection(db, 'users', uid, 'todos');
}

function todoDocRef(uid: string, todoId: string) {
  return doc(db, 'users', uid, 'todos', todoId);
}

export function useTodos(user: User | null) {
  const [todos, dispatch] = useReducer(reducer, undefined, loadFromStorage);
  const [synced, setSynced] = useState(false);

  // Firestore 即時同步（登入時）
  useEffect(() => {
    if (!user) {
      setSynced(false);
      return;
    }
    const unsubscribe = onSnapshot(todosRef(user.uid), (snapshot) => {
      const remoteTodos = snapshot.docs.map(d => d.data() as Todo);
      dispatch({ type: 'SET_ALL', payload: remoteTodos });
      setSynced(true);
    });
    return unsubscribe;
  }, [user]);

  // localStorage 備援（未登入時）
  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, user]);

  // 首次登入時將 localStorage 資料遷移到 Firestore
  useEffect(() => {
    if (!user || !synced) return;
    const local = loadFromStorage();
    if (local.length === 0) return;
    const batch = writeBatch(db);
    local.forEach(todo => {
      batch.set(todoDocRef(user.uid, todo.id), todo);
    });
    batch.commit().then(() => {
      localStorage.removeItem(STORAGE_KEY);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [synced]);

  const addTodo = (payload: Omit<Todo, 'id' | 'createdAt' | 'completed'>) => {
    const newTodo: Todo = {
      id: uuidv4(),
      createdAt: Date.now(),
      completed: false,
      ...payload,
    };
    if (user) {
      setDoc(todoDocRef(user.uid, newTodo.id), newTodo);
    } else {
      dispatch({ type: 'ADD', payload });
    }
  };

  const updateTodo = (id: string, changes: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
    if (user) {
      const todo = todos.find(t => t.id === id);
      if (todo) setDoc(todoDocRef(user.uid, id), { ...todo, ...changes });
    } else {
      dispatch({ type: 'UPDATE', payload: { id, changes } });
    }
  };

  const deleteTodo = (id: string) => {
    if (user) {
      deleteDoc(todoDocRef(user.uid, id));
    } else {
      dispatch({ type: 'DELETE', payload: id });
    }
  };

  const toggleComplete = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    if (user) {
      setDoc(todoDocRef(user.uid, id), { ...todo, completed: !todo.completed });
    } else {
      dispatch({ type: 'TOGGLE_COMPLETE', payload: id });
    }
  };

  const moveTodo = (id: string, quadrant: QuadrantId) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    if (user) {
      setDoc(todoDocRef(user.uid, id), { ...todo, quadrant });
    } else {
      dispatch({ type: 'MOVE', payload: { id, quadrant } });
    }
  };

  return { todos, addTodo, updateTodo, deleteTodo, toggleComplete, moveTodo };
}

