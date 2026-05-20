import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority, Department, STATUSES, DEPARTMENTS } from '../types';
import { X, Calendar, User, Eye, Edit3, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    id?: string;
    title: string;
    description: string;
    owner: string;
    dueDate: string;
    priority: Priority;
    department: Department;
    status: TaskStatus;
  }) => void;
  task?: Task | null;
  defaultStatus?: TaskStatus;
  availableOwners: string[];
}

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  task,
  defaultStatus,
  availableOwners
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [department, setDepartment] = useState<Department>('Marketing');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});

  // Reset or load data when modal opens/closes or when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setOwner(task.owner);
      setDueDate(task.dueDate);
      setPriority(task.priority);
      setDepartment(task.department);
      setStatus(task.status);
    } else {
      // Create mode
      setTitle('');
      setDescription('');
      setOwner('');
      // Default to today's date formatted as YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      setDueDate(today);
      setPriority('Medium');
      setDepartment('Marketing');
      setStatus(defaultStatus || 'To Do');
    }
    setErrors({});
    setActiveTab('write');
  }, [task, defaultStatus, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: { title?: string; dueDate?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 80) {
      newErrors.title = 'Title should be short and actionable (max 80 chars)';
    }

    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: task?.id,
      title: title.trim(),
      description: description.trim(),
      owner: owner.trim() || 'Unassigned',
      dueDate,
      priority,
      department,
      status
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="relative bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-100 flex flex-col max-h-[90vh] transition-transform duration-300 scale-100"
        id="task-form-modal"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
              {task ? 'Edit Task Details' : 'Create New Campaign Task'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Define high-level brand strategy or tactical execution card</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            id="close-modal-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          
          {/* Title Field input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Task Title <span className="text-rose-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. Q3 Merchandising Shelf Proofing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all ${
                errors.title ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500' : 'border-slate-200'
              }`}
            />
            {errors.title && <p className="text-[11px] font-medium text-rose-500">{errors.title}</p>}
          </div>

          {/* Department, Priority & Status Rows */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Department enum */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {Object.keys(DEPARTMENTS).map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Enum */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="High">🔴 High Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="Low">🔵 Low Priority</option>
              </select>
            </div>

            {/* Lane Status Column */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Workflow Lane</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {STATUSES.map((lane) => (
                  <option key={lane} value={lane}>
                    {lane}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Owner & Due Date Rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Owner Autocomplete input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <User size={12} className="text-slate-400" /> Owner Name
              </label>
              <input
                type="text"
                list="owner-options"
                placeholder="e.g. Sarah Connor"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
              />
              <datalist id="owner-options">
                {availableOwners.map(name => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>

            {/* Due date input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Calendar size={12} className="text-slate-400" /> Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all ${
                  errors.dueDate ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500' : 'border-slate-200'
                }`}
              />
              {errors.dueDate && <p className="text-[11px] font-medium text-rose-500">{errors.dueDate}</p>}
            </div>
          </div>

          {/* Markdown Content Brief block with dual-tab support */}
          <div className="space-y-2 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-500" /> Interactive Markdown Brief
              </span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                    activeTab === 'write' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Edit3 size={11} /> Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                    activeTab === 'preview' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Eye size={11} /> Preview
                </button>
              </div>
            </div>

            {activeTab === 'write' ? (
              <textarea
                placeholder="Give a rich briefing... Supports Markdown! Use **bold**, *italics*, - bullet points, or list counts to clarify objectives..."
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-mono min-h-[140px]"
              />
            ) : (
              <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 overflow-y-auto max-h-[220px] min-h-[140px] prose-custom">
                {description ? (
                  <ReactMarkdown>{description}</ReactMarkdown>
                ) : (
                  <span className="text-slate-400 italic text-xs select-none">No preview brief written yet. Fill in info under the 'Write' tab.</span>
                )}
              </div>
            )}
            <p className="text-[10px] text-slate-400 leading-none">Pro tip: Use markdown guidelines to divide requirements into digestible bullet lists.</p>
          </div>

          {/* Footer Action row */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs focus:ring-2 focus:ring-indigo-100 focus:outline-none transition"
              id="save-task-btn"
            >
              {task ? 'Update Changes' : 'Draft Task Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
