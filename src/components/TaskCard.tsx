import { useState } from 'react';
import { Task, DEPARTMENTS, PRIORITIES } from '../types';
import { Calendar, User, Edit2, Archive, Trash2, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: Task['status']) => void;
}

export default function TaskCard({ task, onEdit, onArchive, onDelete, onStatusChange }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const deptConfig = DEPARTMENTS[task.department] || DEPARTMENTS.Marketing;
  const priorityConfig = PRIORITIES.find(p => p.value === task.priority) || PRIORITIES[2];

  // Logic to determine if task is overdue
  const isOverdue = () => {
    if (task.status === 'Done') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Format date readable
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch (e) {
      // Fallback
    }
    return dateStr;
  };

  return (
    <div
      id={`draggable-task-${task.id}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative flex flex-col justify-between bg-white rounded-xl border border-slate-200 p-4 shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing hover:border-slate-300 hover:shadow-md ${
        isDragging ? 'opacity-40 border-dashed border-indigo-400 scale-[0.98]' : ''
      }`}
    >
      {/* Top Header section */}
      <div className="flex items-start justify-between gap-2 mb-2">
        {/* Department Badge */}
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide ${deptConfig.color} border`}>
          {task.department}
        </span>

        {/* Priority Badge */}
        <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${priorityConfig.color}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-sky-500'}`}></span>
          {task.priority} Priority
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-slate-800 tracking-tight group-hover:text-slate-900 mb-1.5 line-clamp-2">
        {task.title}
      </h4>

      {/* Markdown Description */}
      {task.description && (
        <div className="prose-custom max-h-24 overflow-y-auto mb-3 pr-1 border-b border-slate-50 pb-2">
          <ReactMarkdown>{task.description}</ReactMarkdown>
        </div>
      )}

      {/* Footer Info Rows */}
      <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          {/* Owner details */}
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 border border-slate-200">
              {task.owner ? task.owner.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'}
            </div>
            <span>{task.owner || 'Unassigned'}</span>
          </div>

          {/* Due dates and alert states */}
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
            isOverdue() 
              ? 'bg-rose-50 text-rose-700 font-semibold' 
              : task.status === 'Done'
              ? 'bg-emerald-50 text-emerald-700'
              : 'text-slate-500'
          }`}>
            {isOverdue() ? (
              <AlertCircle size={11} className="text-rose-600 animate-pulse" />
            ) : task.status === 'Done' ? (
              <CheckCircle2 size={11} className="text-emerald-600" />
            ) : (
              <Calendar size={11} />
            )}
            <span>{isOverdue() ? 'Overdue: ' : ''}{formatDate(task.dueDate)}</span>
          </div>
        </div>
      </div>

      {/* Floating Action Bars on Hover */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-sm">
        <button
          onClick={() => onEdit(task)}
          title="Edit Task"
          className="p-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
          id={`edit-btn-${task.id}`}
        >
          <Edit2 size={13} />
        </button>
        <button
          onClick={() => onArchive(task.id)}
          title="Archive Task"
          className="p-1 rounded-md text-slate-500 hover:text-amber-600 hover:bg-slate-50 transition-colors"
          id={`archive-btn-${task.id}`}
        >
          <Archive size={13} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          title="Delete Permanently"
          className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-slate-50 transition-colors"
          id={`delete-btn-${task.id}`}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
