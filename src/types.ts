export type QuadrantId = 'q1' | 'q2' | 'q3' | 'q4';

export interface Todo {
  id: string;
  title: string;
  note: string;
  deadline?: string; // ISO date string YYYY-MM-DD
  quadrant: QuadrantId;
  completed: boolean;
  createdAt: number;
}

export interface QuadrantConfig {
  id: QuadrantId;
  label: string;
  subtitle: string;
  action: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeColor: string;
  important: boolean;
  urgent: boolean;
}

export const QUADRANTS: QuadrantConfig[] = [
  {
    id: 'q1',
    label: '火燒屁股了！',
    subtitle: '立即處理',
    action: 'Do First',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fca5a5',
    badgeColor: '#fee2e2',
    important: true,
    urgent: true,
  },
  {
    id: 'q2',
    label: '有空一定要做',
    subtitle: '排程規劃',
    action: 'Schedule',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fcd34d',
    badgeColor: '#fef3c7',
    important: true,
    urgent: false,
  },
  {
    id: 'q3',
    label: '這誰的事啊？',
    subtitle: '授權他人',
    action: 'Delegate',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#93c5fd',
    badgeColor: '#dbeafe',
    important: false,
    urgent: true,
  },
  {
    id: 'q4',
    label: '晚點再點開',
    subtitle: '考慮刪除',
    action: 'Eliminate',
    color: '#6b7280',
    bgColor: '#f9fafb',
    borderColor: '#d1d5db',
    badgeColor: '#f3f4f6',
    important: false,
    urgent: false,
  },
];
