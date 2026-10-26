import React from 'react';
import { Search, Filter, X, LayoutGrid, List } from 'lucide-react';
import { TicketCategory, TicketPriority, TicketStatus, SlaState, SupportAgent } from '@/types';

export interface FilterState {
  search: string;
  status: TicketStatus | 'all';
  priority: TicketPriority | 'all';
  category: TicketCategory | 'all';
  agent: string | 'all';
  slaState: SlaState | 'all';
}

interface TicketFilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  agents: SupportAgent[];
  viewMode: 'table' | 'kanban';
  setViewMode: (mode: 'table' | 'kanban') => void;
  totalFiltered: number;
}

export const TicketFilterBar: React.FC<TicketFilterBarProps> = ({
  filters,
  setFilters,
  agents,
  viewMode,
  setViewMode,
  totalFiltered,
}) => {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.category !== 'all' ||
    filters.agent !== 'all' ||
    filters.slaState !== 'all';

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      category: 'all',
      agent: 'all',
      slaState: 'all',
    });
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-md">
      {/* Top Search & View Switcher Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets by ID, subject, customer name, or keywords..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Switcher: Table vs Kanban */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="bg-slate-950 border border-slate-800 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs font-medium text-slate-400 px-2">
            {totalFiltered} results
          </span>
        </div>
      </div>

      {/* Filter Dropdowns Row */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
          className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">Status: All</option>
          <option value="new">New</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="waiting_customer">Waiting Customer</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        {/* Priority */}
        <select
          value={filters.priority}
          onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as any }))}
          className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">Priority: All</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
          className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">Category: All</option>
          <option value="Technical Support">Technical Support</option>
          <option value="Billing & Payments">Billing & Payments</option>
          <option value="Account Access">Account Access</option>
          <option value="Product Issue">Product Issue</option>
          <option value="Security">Security</option>
          <option value="Delivery & Orders">Delivery & Orders</option>
          <option value="Other">Other</option>
        </select>

        {/* SLA State */}
        <select
          value={filters.slaState}
          onChange={(e) => setFilters(prev => ({ ...prev, slaState: e.target.value as any }))}
          className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">SLA: All</option>
          <option value="on_track">On Track</option>
          <option value="at_risk">At Risk</option>
          <option value="breached">Breached</option>
          <option value="met">Met</option>
          <option value="paused">Paused</option>
        </select>

        {/* Agent */}
        <select
          value={filters.agent}
          onChange={(e) => setFilters(prev => ({ ...prev, agent: e.target.value }))}
          className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">Agent: All</option>
          <option value="unassigned">Unassigned Only</option>
          {agents.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
