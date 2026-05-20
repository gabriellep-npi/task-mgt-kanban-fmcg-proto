import { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority, Department, BoardActivity } from './types';
import { INITIAL_TASKS } from './data';
import KanbanLane from './components/KanbanLane';
import FiltersBar from './components/FiltersBar';
import TaskModal from './components/TaskModal';
import ArchivedTasksList from './components/ArchivedTasksList';
import { 
  Layers, 
  Plus, 
  Archive, 
  RotateCcw, 
  HardDrive, 
  Sparkles, 
  CheckCircle2, 
  Bell, 
  HelpCircle,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2 as DoneIcon,
  Activity as ActivityIcon
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'PROJECT_VELOCITY_KANBAN_TASKS';
const LOCAL_STORAGE_ACTIVITIES_KEY = 'PROJECT_VELOCITY_KANBAN_ACTIVITIES';

const INITIAL_ACTIVITIES: BoardActivity[] = [
  {
    id: 'act-1',
    user: 'Sarah Connor',
    action: 'created task',
    taskTitle: 'Q3 Retail Campaign Asset Sign-off',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), // 4h ago
    type: 'create'
  },
  {
    id: 'act-2',
    user: 'Markus Vance',
    action: 'started work',
    taskTitle: 'Vendor Audits: Eco-Friendly Shrink Wrap',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2h ago
    type: 'status'
  },
  {
    id: 'act-3',
    user: 'Elena Rostova',
    action: 'marked done',
    taskTitle: 'Influencer Retail Campaign Activation',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), // 1h ago
    type: 'status'
  }
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<BoardActivity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultLaneStatus, setDefaultLaneStatus] = useState<TaskStatus>('To Do');
  
  // Custom Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Filters State
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedOwner, setSelectedOwner] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('due-asc');
  const [onlyOverdue, setOnlyOverdueChange] = useState<boolean>(false);

  // Load initial tasks and activities
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        setTasks(INITIAL_TASKS);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      }
    } catch (e) {
      setTasks(INITIAL_TASKS);
    }

    try {
      const storedActivities = localStorage.getItem(LOCAL_STORAGE_ACTIVITIES_KEY);
      if (storedActivities) {
        setActivities(JSON.parse(storedActivities));
      } else {
        setActivities(INITIAL_ACTIVITIES);
        localStorage.setItem(LOCAL_STORAGE_ACTIVITIES_KEY, JSON.stringify(INITIAL_ACTIVITIES));
      }
    } catch (e) {
      setActivities(INITIAL_ACTIVITIES);
    }
  }, []);


  // Save tasks on state changes
  const saveTasksToLocalStorage = (newTasks: Task[]) => {
    setTasks(newTasks);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTasks));
    } catch (e) {
      console.error("Failed to store task state localstorage", e);
    }
  };

  const logActivity = (action: string, taskTitle: string, type: BoardActivity['type'], user: string = 'Current User') => {
    const newAct: BoardActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      user,
      action,
      taskTitle,
      timestamp: new Date().toISOString(),
      type
    };
    setActivities(prevAct => {
      const updated = [newAct, ...prevAct].slice(0, 15);
      try {
        localStorage.setItem(LOCAL_STORAGE_ACTIVITIES_KEY, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  // Toast notifier trigger
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Gather unique available owners for dynamic checklists/autocomplete suggestion
  const availableOwners = Array.from(
    new Set(
      tasks
        .map(t => t.owner?.trim())
        .filter(owner => owner && owner !== 'Unassigned')
    )
  ).sort();

  // Drag and Drop implementation - Status changer (Optimistic Updates)
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    const targetTask = tasks.find(t => t.id === taskId);
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        if (task.status === newStatus) return task;
        triggerToast(`Moved "${task.title}" to ${newStatus}`, 'success');
        return { ...task, status: newStatus };
      }
      return task;
    });
    saveTasksToLocalStorage(updatedTasks);
    if (targetTask) {
      logActivity(`moved to ${newStatus}`, targetTask.title, 'status', targetTask.owner || 'Current User');
    }
  };

  // Save or Edit task handler from modal
  const handleSaveTask = (taskData: {
    id?: string;
    title: string;
    description: string;
    owner: string;
    dueDate: string;
    priority: Priority;
    department: Department;
    status: TaskStatus;
  }) => {
    if (taskData.id) {
      // Editing
      const updated = tasks.map(t => {
        if (t.id === taskData.id) {
          triggerToast(`Updated checklist specifications for "${taskData.title}"`, 'success');
          return {
            ...t,
            title: taskData.title,
            description: taskData.description,
            owner: taskData.owner,
            dueDate: taskData.dueDate,
            priority: taskData.priority,
            department: taskData.department,
            status: taskData.status
          };
        }
        return t;
      });
      saveTasksToLocalStorage(updated);
      logActivity('updated specifications of', taskData.title, 'status', taskData.owner || 'Current User');
    } else {
      // Creating
      const newTask: Task = {
        id: `fmcg-custom-${Date.now()}`,
        title: taskData.title,
        description: taskData.description,
        owner: taskData.owner,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        department: taskData.department,
        status: taskData.status,
        archived: false,
        createdAt: new Date().toISOString()
      };
      saveTasksToLocalStorage([...tasks, newTask]);
      triggerToast(`Successfully launched draft card "${taskData.title}"`, 'success');
      logActivity('created task', taskData.title, 'create', taskData.owner || 'Current User');
    }
    setEditingTask(null);
  };

  // Archive a task
  const handleArchiveTask = (id: string) => {
    const targetTask = tasks.find(t => t.id === id);
    const updated = tasks.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          archived: true, 
          IsArchived: true, 
          archivedAt: new Date().toISOString() 
        };
      }
      return t;
    });
    saveTasksToLocalStorage(updated);
    if (targetTask) {
      triggerToast(`Archived task "${targetTask.title}"`, 'info');
      logActivity('archived task', targetTask.title, 'archive', targetTask.owner || 'Current User');
    }
  };

  // Restore task from archive
  const handleUnarchiveTask = (id: string) => {
    const targetTask = tasks.find(t => t.id === id);
    const updated = tasks.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          archived: false, 
          IsArchived: false,
          archivedAt: undefined
        };
      }
      return t;
    });
    saveTasksToLocalStorage(updated);
    if (targetTask) {
      triggerToast(`Restored "${targetTask.title}" to standard workflow`, 'success');
      logActivity('restored task', targetTask.title, 'unarchive', targetTask.owner || 'Current User');
    }
  };

  // Delete task permanently
  const handleDeleteTask = (id: string) => {
    const targetTask = tasks.find(t => t.id === id);
    const updated = tasks.filter(t => t.id !== id);
    saveTasksToLocalStorage(updated);
    if (targetTask) {
      triggerToast(`Permanently deleted task record "${targetTask.title}"`, 'error');
      logActivity('permanently deleted', targetTask.title, 'delete', targetTask.owner || 'Current User');
    }
  };

  // Reset entire board to standard FMCG mock tasks
  const handleResetBoardPrerequisites = () => {
    if (window.confirm("Restore demo board presets? This overrides all current tasks.")) {
      saveTasksToLocalStorage(INITIAL_TASKS);
      setActivities(INITIAL_ACTIVITIES);
      try {
        localStorage.setItem(LOCAL_STORAGE_ACTIVITIES_KEY, JSON.stringify(INITIAL_ACTIVITIES));
      } catch (e) {
        // ignore
      }
      triggerToast("Reset workspace matching baseline demo briefs", 'info');
    }
  };

  // Purge entire archive stack
  const handleClearAllArchives = () => {
    const activeOnly = tasks.filter(t => !t.archived && !t.IsArchived);
    saveTasksToLocalStorage(activeOnly);
    triggerToast("All historical archived records permanently purged", 'error');
  };

  // Opens modal in creation state
  const handleOpenCreateModal = (status: TaskStatus = 'To Do') => {
    setDefaultLaneStatus(status);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Opens modal in editing mode
  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Check if a task is overdue
  const isOverdueTask = (t: Task) => {
    if (t.status === 'Done' || t.archived || t.IsArchived) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  // Filter & Sort math
  const activeTasks = tasks.filter(t => !t.archived && !t.IsArchived);
  const archivedTasks = tasks.filter(t => t.archived || t.IsArchived);

  const filteredTasks = activeTasks.filter(task => {
    // 1. Department Filter
    if (selectedDepartment !== 'All' && task.department !== selectedDepartment) return false;
    
    // 2. Owner Filter
    if (selectedOwner !== 'All' && task.owner !== selectedOwner) return false;
    
    // 3. Priority Filter
    if (selectedPriority !== 'All' && task.priority !== selectedPriority) return false;

    // 4. Overdue Filter
    if (onlyOverdue && !isOverdueTask(task)) return false;

    // 5. Keyword search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchDesc = task.description?.toLowerCase().includes(query) || false;
      const matchOwner = task.owner?.toLowerCase().includes(query) || false;
      const matchDept = task.department.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchOwner && !matchDept) return false;
    }

    return true;
  });

  // Sort logic applied on filtered tasks
  const sortedAndFilteredTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'due-asc') {
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (sortBy === 'due-desc') {
      return b.dueDate.localeCompare(a.dueDate);
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    }
    if (sortBy === 'priority-high') {
      const weight = { High: 3, Medium: 2, Low: 1 };
      return weight[b.priority] - weight[a.priority];
    }
    return 0;
  });

  // Count widgets calculation
  const totalActiveCount = activeTasks.length;
  const overdueCount = activeTasks.filter(isOverdueTask).length;
  const inProgressCount = activeTasks.filter(t => t.status === 'In Progress').length;
  const completedCount = activeTasks.filter(t => t.status === 'Done').length;

  // Relative time helper for activity log
  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  // Circular gauge calculations
  const progressPercentage = totalActiveCount > 0 ? Math.round((completedCount / totalActiveCount) * 100) : 0;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-950 pb-12">
      
      {/* Dynamic Toast Feedback Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200/60 shadow-lg bg-white/95 backdrop-blur-xs text-xs font-semibold animate-slide-in">
          <span className={`h-2 w-2 rounded-full ${
            toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-indigo-500'
          }`} />
          <span className="text-slate-700">{toast.message}</span>
        </div>
      )}

      {/* Main Container Wrapper */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 space-y-5">
        
        {/* Header Block Section */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-3xs">
          
          {/* Logo & Subtitle branding */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
              <Layers size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 font-sans" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Project Velocity Kanban
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-55 text-indigo-700 border border-indigo-100">
                  Version 1.1 MVP
                </span>
              </div>
              <p className="text-xs text-slate-500">Retail FMCG Campaign Rollouts & Operations Hub</p>
            </div>
          </div>

          {/* Connection Status indicator & Controls Row */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            {/* Connection tracker */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-100 bg-emerald-50/50 text-[10px] text-emerald-700 font-medium h-[32px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Local Database Active</span>
            </div>

            {/* Reset Defaults button */}
            <button
              onClick={handleResetBoardPrerequisites}
              className="px-3 py-1.5 h-[32px] text-slate-500 hover:text-slate-850 hover:bg-slate-50 rounded-xl border border-slate-200 bg-white shadow-3xs transition-all flex items-center gap-1.5 text-[11px] font-bold cursor-pointer"
              title="Reset tasks to standard factory baseline"
            >
              <RotateCcw size={12} /> <span className="hidden md:inline">Reset Presets</span>
            </button>

            {/* Archive Bin toggle */}
            <button
              onClick={() => setIsArchiveOpen(true)}
              className="relative px-3 py-1.5 h-[32px] text-slate-655 hover:text-indigo-605 hover:bg-indigo-50/40 hover:border-indigo-200 rounded-xl border border-slate-200 bg-white shadow-3xs transition-all flex items-center gap-1.5 text-[11.5px] font-bold cursor-pointer"
              id="open-archives-btn"
              title="Open Historical Archives slide-over drawer panel"
            >
              <Archive size={12} className="stroke-[2.2] text-slate-500 group-hover:text-indigo-600" />
              <span>Archives</span>
              {archivedTasks.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white font-black text-[9px] h-4 w-4 rounded-full flex items-center justify-center animate-pulse shadow-3xs border-2 border-white">
                  {archivedTasks.length}
                </span>
              )}
            </button>

            {/* Add Task Primary Trigger */}
            <button
              onClick={() => handleOpenCreateModal('To Do')}
              className="px-4 py-1.5 h-[32px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-md hover:shadow-indigo-150 transition-all flex items-center gap-1.5 cursor-pointer border-none"
              id="global-add-task-btn"
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span>Add Task</span>
            </button>
          </div>
        </header>

        {/* Primary Bento Layout Grid Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Main Taskboard Section (3 columns) */}
          <div className="lg:col-span-3 space-y-5">
            {/* Global Settings with Search and Selects */}
            <FiltersBar
              selectedDepartment={selectedDepartment}
              onDepartmentChange={setSelectedDepartment}
              selectedOwner={selectedOwner}
              onOwnerChange={setSelectedOwner}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedPriority={selectedPriority}
              onPriorityChange={setSelectedPriority}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              onlyOverdue={onlyOverdue}
              onOnlyOverdueChange={setOnlyOverdueChange}
              availableOwners={availableOwners}
              activeTasksCount={sortedAndFilteredTasks.length}
            />

            {/* Horizontal Tri-column board containing lanes */}
            <main className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
              <KanbanLane
                status="To Do"
                tasks={sortedAndFilteredTasks.filter(t => t.status === 'To Do')}
                onEdit={handleOpenEditModal}
                onArchive={handleArchiveTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
                onAddTaskClick={handleOpenCreateModal}
              />
              <KanbanLane
                status="In Progress"
                tasks={sortedAndFilteredTasks.filter(t => t.status === 'In Progress')}
                onEdit={handleOpenEditModal}
                onArchive={handleArchiveTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
                onAddTaskClick={handleOpenCreateModal}
              />
              <KanbanLane
                status="Done"
                tasks={sortedAndFilteredTasks.filter(t => t.status === 'Done')}
                onEdit={handleOpenEditModal}
                onArchive={handleArchiveTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
                onAddTaskClick={handleOpenCreateModal}
              />
            </main>
          </div>

          {/* Right Bento Sidebar Column (1 column) */}
          <aside className="lg:col-span-1 space-y-5 flex flex-col">
            
            {/* Sprint Progress Box (Circular Ring widget) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs flex flex-col justify-between align-middle">
              <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Board Progress</span>
                <span className="text-[10px] text-slate-400 font-mono">Q3 ACTIVE</span>
              </h3>
              
              <div className="relative h-28 w-28 mx-auto my-1 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Track ring */}
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    className="stroke-slate-100 fill-none"
                    strokeWidth="8"
                  />
                  {/* Animated actual progress bar */}
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    className="stroke-indigo-600 fill-none transition-all duration-300"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Embedded percent string */}
                <span className="absolute text-xl font-extrabold text-slate-800 tracking-tighter sans-serif">
                  {progressPercentage}%
                </span>
              </div>

              <div className="text-center mt-3 pt-3 border-t border-slate-50 space-y-1">
                <p className="text-[11px] text-slate-500 font-medium">
                  Done items: <b className="text-slate-800 font-bold">{completedCount}</b> of {totalActiveCount} active
                </p>
                <p className="text-[10px] text-slate-400">
                  {totalActiveCount - completedCount} pending campaign items
                </p>
              </div>
            </div>

            {/* Campaign Workload Metrics grid Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
                Workload KPI Tracker
              </h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-150/40">
                  <span className="text-xl font-extrabold text-indigo-700 block tracking-tight">{totalActiveCount}</span>
                  <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-wide">Campaigns</span>
                </div>
                <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-150/40">
                  <span className="text-xl font-extrabold text-amber-700 block tracking-tight">{inProgressCount}</span>
                  <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wide">In Progress</span>
                </div>
                <div className={`${overdueCount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-250/20'} p-3 rounded-xl border transition-colors`}>
                  <span className={`text-xl font-extrabold block tracking-tight ${overdueCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-500'}`}>
                    {overdueCount}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wide ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>Overdue</span>
                </div>
                <div 
                  onClick={() => setIsArchiveOpen(true)}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 active:bg-slate-200/50 border border-slate-250/20 hover:border-slate-300 rounded-xl transition-all cursor-pointer group/card select-none"
                  title="Open historical archives panel"
                >
                  <span className="text-xl font-extrabold text-slate-700 block tracking-tight group-hover/card:text-indigo-600 transition-colors">
                    {archivedTasks.length}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide group-hover/card:text-slate-500 transition-colors">
                    Archived
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Recent Events Log Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ActivityIcon size={12} className="text-indigo-500" /> Recent Activity
                  </h3>
                  {activities.length > 0 && (
                    <button
                      onClick={() => {
                        setActivities([]);
                        try { localStorage.removeItem(LOCAL_STORAGE_ACTIVITIES_KEY); } catch(e) {}
                      }}
                      className="text-[9px] font-semibold text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      Clear Log
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {activities.length > 0 ? (
                    activities.map((act) => {
                      // Color select based on activity type
                      const getActionDot = () => {
                        switch(act.type) {
                          case 'create': return 'bg-emerald-500';
                          case 'status': return 'bg-indigo-500';
                          case 'archive': return 'bg-amber-500';
                          case 'unarchive': return 'bg-blue-400';
                          case 'delete': return 'bg-rose-500';
                          default: return 'bg-slate-400';
                        }
                      };
                      return (
                        <div key={act.id} className="flex gap-2.5 items-start text-[11px] leading-relaxed border-b border-slate-50/60 pb-2.5 last:border-b-0 last:pb-0">
                          <span className={`h-1.5 w-1.5 rounded-full ${getActionDot()} mt-1.5 shrink-0`} />
                          <div className="flex-1">
                            <span className="font-bold text-slate-700 mr-1">{act.user}</span>
                            <span className="text-slate-500">{act.action}</span>
                            <p className="font-semibold text-slate-800 line-clamp-1 mt-0.5">{act.taskTitle}</p>
                            <span className="text-[9px] text-slate-400 block mt-0.5">{getRelativeTime(act.timestamp)}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center text-slate-400 italic text-[11px] select-none">
                      No system events tracked in this session.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>

      {/* Task Creation & Editing Popup Modal Dialog */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        defaultStatus={defaultLaneStatus}
        availableOwners={availableOwners}
      />

      {/* Slide-out Archives Drawer logs */}
      <ArchivedTasksList
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        tasks={archivedTasks}
        onUnarchive={handleUnarchiveTask}
        onDelete={handleDeleteTask}
        onClearAll={handleClearAllArchives}
      />
    </div>
  );
}
