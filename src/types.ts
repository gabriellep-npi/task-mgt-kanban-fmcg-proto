export type Priority = 'High' | 'Medium' | 'Low';

export type Department = 'Marketing' | 'Supply Chain' | 'Creative' | 'Operations' | 'Finance';

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface Task {
  id: string;
  title: string;
  description: string;
  owner: string;
  dueDate: string; // YYYY-MM-DD
  priority: Priority;
  department: Department;
  status: TaskStatus;
  archived: boolean;
  IsArchived?: boolean;
  archivedAt?: string; // ISO string when archived
  createdAt: string;
}

export interface DepartmentConfig {
  name: Department;
  color: string; // Tailwind class background
  text: string;  // Tailwind class text
  border: string; // Tailwind class border
  badge: string; // Tailwind class badge bg
}

export const DEPARTMENTS: Record<Department, DepartmentConfig> = {
  Marketing: {
    name: 'Marketing',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-100/80 text-blue-800'
  },
  'Supply Chain': {
    name: 'Supply Chain',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100/80 text-emerald-800'
  },
  Creative: {
    name: 'Creative',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    text: 'text-purple-700',
    border: 'border-purple-200',
    badge: 'bg-purple-100/80 text-purple-800'
  },
  Operations: {
    name: 'Operations',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-100/80 text-amber-800'
  },
  Finance: {
    name: 'Finance',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    text: 'text-rose-700',
    border: 'border-rose-200',
    badge: 'bg-rose-100/80 text-rose-800'
  }
};

export const PRIORITIES: { value: Priority; color: string; bg: string }[] = [
  { value: 'High', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
  { value: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  { value: 'Low', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' }
];

export const STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Done'];

export interface BoardActivity {
  id: string;
  user: string;
  action: string;
  taskTitle: string;
  timestamp: string;
  type: 'create' | 'status' | 'archive' | 'unarchive' | 'delete' | 'reset';
}

