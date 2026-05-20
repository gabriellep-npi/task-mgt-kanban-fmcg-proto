import { useState } from 'react';
import { Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';
import { PlusCircle, ShoppingBag, Loader2, CheckCircle } from 'lucide-react';

interface KanbanLaneProps {
  status: TaskStatus;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onAddTaskClick: (status: TaskStatus) => void;
}

export default function KanbanLane({
  status,
  tasks,
  onEdit,
  onArchive,
  onDelete,
  onStatusChange,
  onAddTaskClick
}: KanbanLaneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  // Dynamic status headers styling
  const getHeaderStyles = () => {
    switch (status) {
      case 'To Do':
        return {
          title: 'To Do',
          headerBg: 'bg-slate-100 border-slate-200 text-slate-700',
          indicator: 'bg-slate-400',
          laneBg: 'bg-slate-50/50 border-slate-200'
        };
      case 'In Progress':
        return {
          title: 'In Progress',
          headerBg: 'bg-amber-50 border-amber-200/50 text-amber-800',
          indicator: 'bg-amber-500',
          laneBg: 'bg-amber-50/10 border-slate-200'
        };
      case 'Done':
        return {
          title: 'Done',
          headerBg: 'bg-emerald-50 border-emerald-200/50 text-emerald-800',
          indicator: 'bg-emerald-500',
          laneBg: 'bg-emerald-50/10 border-slate-200'
        };
    }
  };

  const styles = getHeaderStyles();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onStatusChange(taskId, status);
    }
  };

  return (
    <div
      id={`kanban-lane-${status.toLowerCase().replace(' ', '-')}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col flex-1 min-w-[300px] h-full rounded-2xl border-2 p-4 transition-all duration-200 ${
        isDragOver 
          ? 'border-indigo-400 bg-indigo-50/20 shadow-xs' 
          : 'border-slate-100 bg-slate-50/30'
      }`}
    >
      {/* Title Header banner */}
      <div className={`flex items-center justify-between p-3 rounded-xl border mb-4 font-medium ${styles.headerBg} shadow-2xs`}>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${styles.indicator}`}></span>
          <span className="text-sm font-semibold tracking-wide">{styles.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-bold shadow-3xs">
            {tasks.length}
          </span>
          <button
            onClick={() => onAddTaskClick(status)}
            title={`Add task to ${styles.title}`}
            className="p-1 rounded-md bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 shadow-3xs transition-colors"
            id={`add-task-btn-${status.toLowerCase().replace(' ', '-')}`}
          >
            <PlusCircle size={14} />
          </button>
        </div>
      </div>

      {/* Cards Stream */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[600px] min-h-[300px] pb-6 pr-1">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onArchive={onArchive}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))
        ) : (
          /* Empty Lane design placeholder */
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 select-none">
            {status === 'To Do' ? (
              <ShoppingBag size={24} className="mb-2 text-slate-300 stroke-1" />
            ) : status === 'In Progress' ? (
              <Loader2 size={24} className="mb-2 text-slate-300 stroke-1" />
            ) : (
              <CheckCircle size={24} className="mb-2 text-slate-300 stroke-1" />
            )}
            <p className="text-xs font-medium text-slate-500">No tasks in {styles.title}</p>
            <p className="text-[10px] text-slate-400 mt-1">Drag cards here or click add button</p>
          </div>
        )}
      </div>
    </div>
  );
}
