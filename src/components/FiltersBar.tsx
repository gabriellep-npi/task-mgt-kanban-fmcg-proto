import { Department, Priority } from '../types';
import { Search, RotateCcw, SlidersHorizontal, ArrowUpDown, Filter } from 'lucide-react';

interface FiltersBarProps {
  // Department filter
  selectedDepartment: string; // 'All' | Department
  onDepartmentChange: (dept: string) => void;
  // Owner filter
  selectedOwner: string; // 'All' | Owner Name
  onOwnerChange: (owner: string) => void;
  // Search query
  searchQuery: string;
  onSearchChange: (query: string) => void;
  // Priority filter
  selectedPriority: string; // 'All' | Priority
  onPriorityChange: (priority: string) => void;
  // Sort field
  sortBy: string; // 'due-asc' | 'due-desc' | 'priority-high' | 'newest'
  onSortByChange: (sortBy: string) => void;
  // Overdue status filter
  onlyOverdue: boolean;
  onOnlyOverdueChange: (only: boolean) => void;
  // Helper data
  availableOwners: string[];
  activeTasksCount: number;
}

export default function FiltersBar({
  selectedDepartment,
  onDepartmentChange,
  selectedOwner,
  onOwnerChange,
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  sortBy,
  onSortByChange,
  onlyOverdue,
  onOnlyOverdueChange,
  availableOwners,
  activeTasksCount
}: FiltersBarProps) {
  const isFiltered = 
    selectedDepartment !== 'All' || 
    selectedOwner !== 'All' || 
    selectedPriority !== 'All' || 
    searchQuery.trim() !== '' || 
    onlyOverdue;

  const handleReset = () => {
    onDepartmentChange('All');
    onOwnerChange('All');
    onPriorityChange('All');
    onSearchChange('');
    onSortByChange('due-asc');
    onOnlyOverdueChange(false);
  };

  return (
    <div 
      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-3xs flex flex-col gap-3.5"
      id="global-filters-container"
    >
      {/* Search & Reset Header row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns, tasks, or packaging briefs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all bg-slate-50/50"
            id="search-input-field"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Counter and Active Filter Reset */}
        <div className="flex items-center justify-end w-full md:w-auto gap-4">
          <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">
            Matches: <b className="text-slate-800 bg-slate-100 border px-2 py-0.5 rounded-md">{activeTasksCount}</b> active cards
          </span>
          {isFiltered && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              id="reset-filters-btn"
            >
              <RotateCcw size={11} /> Reset Filter Set
            </button>
          )}
        </div>
      </div>

      {/* Multipurpose Selectors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 border-t border-slate-100 pt-3.5">
        {/* Department Dropdown filter (PRD required) */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Filter size={10} /> Department
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:bg-white cursor-pointer transition-all"
            id="department-filter-select"
          >
            <option value="All">All Departments</option>
            <option value="Marketing">Marketing</option>
            <option value="Supply Chain">Supply Chain</option>
            <option value="Creative">Creative</option>
            <option value="Operations">Operations</option>
            <option value="Finance">Finance</option>
          </select>
        </div>

        {/* Owner Dropdown filter (PRD required) */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Filter size={10} /> Owner / Assignee
          </label>
          <select
            value={selectedOwner}
            onChange={(e) => onOwnerChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:bg-white cursor-pointer transition-all"
            id="owner-filter-select"
          >
            <option value="All">All Owners</option>
            {availableOwners.map(owner => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Filter size={10} /> Priority Value
          </label>
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:bg-white cursor-pointer transition-all"
            id="priority-filter-select"
          >
            <option value="All">All Priorities</option>
            <option value="High">🔴 High Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="Low">🔵 Low Priority</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpDown size={10} /> Sort Order
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:bg-white cursor-pointer transition-all"
            id="sorting-order-select"
          >
            <option value="due-asc">Due Date: Nearest First</option>
            <option value="due-desc">Due Date: Furthest First</option>
            <option value="priority-high">Priority: High to Low</option>
            <option value="newest">Created: Newest Drafted</option>
          </select>
        </div>

        {/* Action states - Overdue checkbox */}
        <div className="flex items-center justify-start h-full pt-4 md:pt-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyOverdue}
              onChange={(e) => onOnlyOverdueChange(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              id="overdue-only-checkbox"
            />
            <span className="text-xs font-semibold text-rose-700 bg-rose-50/50 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded px-2 py-0.5 transition-all">
              ⚠️ Show Overdue Only
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
