import React, { useState, useEffect } from 'react';
import { Task, DEPARTMENTS } from '../types';
import { X, Archive, RotateCcw, Trash2, ShieldAlert, Search } from 'lucide-react';

interface ArchivedTasksListProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function ArchivedTasksList({
  isOpen,
  onClose,
  tasks,
  onUnarchive,
  onDelete,
  onClearAll
}: ArchivedTasksListProps) {
  const [active, setActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // Smooth slide-over transition logic
  useEffect(() => {
    let timeoutId: any;
    if (isOpen) {
      setActive(true);
    } else {
      timeoutId = setTimeout(() => setActive(false), 300);
    }
    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  if (!isOpen && !active) return null;

  // Helper to extract clean owner initials
  const getOwnerInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Helper to choose a unique warm/pastel color for each user's initials
  const getOwnerColor = (name?: string) => {
    if (!name) return 'bg-slate-100 text-slate-600 border-slate-200';
    const codes = [
      'bg-indigo-50 text-indigo-700 border-indigo-200',
      'bg-sky-50 text-sky-700 border-sky-100',
      'bg-emerald-50 text-emerald-700 border-emerald-100',
      'bg-amber-50 text-amber-700 border-amber-100',
      'bg-rose-50 text-rose-700 border-rose-100',
      'bg-purple-50 text-purple-700 border-purple-100'
    ];
    let val = 0;
    for (let i = 0; i < name.length; i++) val += name.charCodeAt(i);
    return codes[val % codes.length];
  };

  // Helper to group archived items by month (May 2026, April 2026, etc)
  const getArchiveMonthYear = (task: Task) => {
    const dateStr = task.archivedAt || task.createdAt || new Date().toISOString();
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch (e) {
      return 'May 2026';
    }
  };

  // Search & category filter logic
  const filteredTasks = tasks.filter(task => {
    const query = searchQuery.toLowerCase();
    const matchQuery = 
      task.title.toLowerCase().includes(query) ||
      (task.description?.toLowerCase().includes(query) ?? false) ||
      task.owner.toLowerCase().includes(query);
    const matchDept = deptFilter === 'All' || task.department === deptFilter;
    return matchQuery && matchDept;
  });

  // Sort filtered tasks chronologically descending by archiving/creation time
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const dateA = new Date(a.archivedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.archivedAt || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  // Dynamic Month grouping map
  const groupOrder: string[] = [];
  const groups: Record<string, Task[]> = {};

  sortedTasks.forEach(task => {
    const monthYear = getArchiveMonthYear(task);
    if (!groups[monthYear]) {
      groups[monthYear] = [];
      groupOrder.push(monthYear);
    }
    groups[monthYear].push(task);
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      
      {/* Backdrop overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out cursor-pointer ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`} 
        onClick={onClose} 
      />

      {/* Slide-over Drawer Pane */}
      <div 
        className={`relative w-full max-w-md bg-slate-50 h-full shadow-2xl border-l border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out transform z-10 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        id="archived-tasks-drawer"
      >
        
        {/* Custom inline micro-modal confirmation inside the slide-over */}
        {deletingTaskId && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-5 z-20">
            <div className="bg-white rounded-2xl p-5 max-w-xs w-full border border-slate-200 shadow-2xl animate-scale-up text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 text-rose-600 mb-4 mx-auto border border-rose-100">
                <ShieldAlert size={22} className="stroke-[2.2]" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {deletingTaskId === 'ALL_MUTED_PURGE' ? 'Purge Entire Archives?' : 'Purge Task Record?'}
              </h4>
              <p className="text-[10.5px] text-slate-500 mt-2 leading-relaxed">
                {deletingTaskId === 'ALL_MUTED_PURGE' 
                  ? 'All archived campaign files will be permanently wiped. This action is terminal and cannot be reversed.'
                  : 'This campaign file will be permanently deleted from database history. There is no backup.'
                }
              </p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setDeletingTaskId(null)}
                  className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-705 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deletingTaskId === 'ALL_MUTED_PURGE') {
                      onClearAll();
                    } else {
                      onDelete(deletingTaskId);
                    }
                    setDeletingTaskId(null);
                  }}
                  className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Drawer Header Block */}
        <div className="px-5 py-4 border-b border-slate-200/60 flex items-center justify-between bg-white shadow-3xs">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
              <Archive size={16} className="text-slate-500 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Historical Archives</h3>
              <p className="text-[10px] text-slate-450 font-medium">FMCG campaign files removed from lanes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200/60 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Search & Filter Bar Section */}
        <div className="px-4 py-3 border-b border-slate-200/40 bg-white flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search archived briefs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-3xs"
            />
            <span className="absolute left-2.5 top-2 text-slate-400">
              <Search size={12} />
            </span>
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs text-slate-650 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer font-medium"
          >
            <option value="All">All Sectors</option>
            <option value="Marketing">Marketing</option>
            <option value="Supply Chain">Supply Chain</option>
            <option value="Creative">Creative</option>
            <option value="Operations">Operations</option>
            <option value="Finance">Finance</option>
          </select>
        </div>

        {/* Scrollable Tasks Group Bucket */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {groupOrder.length > 0 ? (
            groupOrder.map((monthYear) => (
              <div key={monthYear} className="space-y-3">
                {/* Month Group Divider Header */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                    {monthYear}
                  </span>
                  <div className="flex-1 h-[1px] bg-slate-200/60" />
                  <span className="text-[9px] font-mono text-slate-400 font-bold">{groups[monthYear].length} brief{groups[monthYear].length > 1 ? 's' : ''}</span>
                </div>

                {/* Cards List */}
                <div className="space-y-2.5">
                  {groups[monthYear].map((task) => {
                    const deptConfig = DEPARTMENTS[task.department];
                    const ownerInitials = getOwnerInitials(task.owner);
                    const ownerColorClass = getOwnerColor(task.owner);

                    return (
                      <div 
                        key={task.id} 
                        className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between gap-1.5 hover:border-slate-300 hover:shadow-3xs transition-all group"
                      >
                        <div className="flex items-center justify-between text-[11px] font-medium">
                          <span className={`px-2 py-0.5 rounded border text-[9px] font-extrabold uppercase tracking-wide ${deptConfig?.color || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {task.department}
                          </span>
                          <span className="text-slate-400 text-[9.5px] font-semibold bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                            Stage: {task.status}
                          </span>
                        </div>

                        <h5 className="text-xs font-extrabold text-slate-850 leading-snug tracking-tight">
                          {task.title}
                        </h5>

                        {task.description && (
                          <p className="text-[10px] text-slate-400 line-clamp-2 italic leading-relaxed">
                            {task.description.replace(/[#*`_]/g, '')}
                          </p>
                        )}

                        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-1">
                          {/* Owner details with Initials/Avatar */}
                          <div className="flex items-center gap-1.5">
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold tracking-tighter border shadow-3xs ${ownerColorClass}`}>
                              {ownerInitials}
                            </div>
                            <span className="text-[10px] text-slate-550 font-semibold">{task.owner}</span>
                          </div>

                          {/* Restore & Purge actions */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onUnarchive(task.id)}
                              className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-2 py-1 rounded-lg text-[9.5px] font-extrabold text-slate-600 hover:text-slate-800 shadow-3xs transition-all cursor-pointer h-7"
                              title="Restore to active board"
                            >
                              <RotateCcw size={10} className="stroke-[2.5]" />
                              <span>Restore</span>
                            </button>
                            <button
                              onClick={() => setDeletingTaskId(task.id)}
                              className="p-1 px-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/50 hover:border-rose-100 rounded-lg transition-colors cursor-pointer h-7 flex items-center justify-center"
                              title="Purge permanently"
                            >
                              <Trash2 size={11} className="stroke-[2]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="h-4/5 flex flex-col items-center justify-center p-8 text-center text-slate-400 select-none my-12">
              <Archive size={32} className="stroke-1 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">No Archived Briefs Matches</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                {tasks.length > 0 
                  ? "Adjust search input keywords or sectors dropdown filters to look for other briefs."
                  : "Completed project cards can be archived to keep active board workspace clean."}
              </p>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions warnings */}
        {tasks.length > 0 && (
          <div className="p-4 border-t border-slate-200/60 bg-white flex flex-col gap-2">
            <div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-150 text-[10px] text-amber-800 leading-normal">
              <ShieldAlert size={14} className="shrink-0 text-amber-500 mt-0.5 stroke-[2.2]" />
              <p className="font-medium">Warning: Purging tasks permanently decomposes all histories. Individual or complete purging cannot be recovered.</p>
            </div>
            <button
              onClick={() => setDeletingTaskId('ALL_MUTED_PURGE')}
              className="w-full py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <Trash2 size={13} className="stroke-[2]" /> Purge Entire Archives
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
