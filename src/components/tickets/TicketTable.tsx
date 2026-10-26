import React, { useState } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  User,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Ticket, SupportAgent, Customer } from '@/types';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { SlaBadge } from './SlaBadge';
import { formatRelativeTime, formatTimeRemaining } from '@/lib/utils';

interface TicketTableProps {
  tickets: Ticket[];
  agents: SupportAgent[];
  customers: Customer[];
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  onSelectTicket: (ticket: Ticket) => void;
}

type SortField = 'id' | 'subject' | 'priority' | 'status' | 'createdAt' | 'resolutionDeadline';

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  agents,
  customers,
  selectedIds,
  setSelectedIds,
  onSelectTicket,
}) => {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const agentMap = new Map(agents.map(a => [a.id, a.name]));
  const customerMap = new Map(customers.map(c => [c.id, c]));

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedTickets = React.useMemo(() => {
    return [...tickets].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') {
        comparison = a.id.localeCompare(b.id);
      } else if (sortField === 'subject') {
        comparison = a.subject.localeCompare(b.subject);
      } else if (sortField === 'priority') {
        const pOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        comparison = pOrder[a.priority] - pOrder[b.priority];
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === 'resolutionDeadline') {
        comparison = new Date(a.resolutionDeadline).getTime() - new Date(b.resolutionDeadline).getTime();
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [tickets, sortField, sortAsc]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedTickets.length / pageSize) || 1;
  const paginatedTickets = sortedTickets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const isAllSelected = paginatedTickets.length > 0 && paginatedTickets.every(t => selectedIds.includes(t.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !paginatedTickets.some(t => t.id === id)));
    } else {
      const pageIds = paginatedTickets.map(t => t.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3 h-3 text-indigo-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-400" />
    );
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden text-slate-100 flex flex-col">
      {/* Table Container with Horizontal Scroll Support */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 select-none uppercase font-semibold text-[11px] tracking-wider">
            <tr>
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-600"
                />
              </th>
              <th className="py-3 px-4 cursor-pointer group" onClick={() => handleSort('id')}>
                <div className="flex items-center gap-1.5">
                  <span>Ticket ID</span>
                  {renderSortIndicator('id')}
                </div>
              </th>
              <th className="py-3 px-4 min-w-[280px] cursor-pointer group" onClick={() => handleSort('subject')}>
                <div className="flex items-center gap-1.5">
                  <span>Subject</span>
                  {renderSortIndicator('subject')}
                </div>
              </th>
              <th className="py-3 px-4 min-w-[160px]">Customer</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 cursor-pointer group" onClick={() => handleSort('priority')}>
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  {renderSortIndicator('priority')}
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer group" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {renderSortIndicator('status')}
                </div>
              </th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4 cursor-pointer group" onClick={() => handleSort('createdAt')}>
                <div className="flex items-center gap-1.5">
                  <span>Created</span>
                  {renderSortIndicator('createdAt')}
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer group" onClick={() => handleSort('resolutionDeadline')}>
                <div className="flex items-center gap-1.5">
                  <span>SLA State</span>
                  {renderSortIndicator('resolutionDeadline')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-normal">
            {paginatedTickets.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-500">
                  No tickets matched the current search or filters.
                </td>
              </tr>
            ) : (
              paginatedTickets.map((ticket) => {
                const customer = customerMap.get(ticket.customerId);
                const agentName = ticket.assignedAgentId ? agentMap.get(ticket.assignedAgentId) || 'Unassigned' : 'Unassigned';
                const remaining = formatTimeRemaining(ticket.resolutionDeadline);
                const isSelected = selectedIds.includes(ticket.id);

                return (
                  <tr
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className={`hover:bg-slate-800/50 cursor-pointer transition-colors group ${
                      isSelected ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4" onClick={(e) => toggleSelectOne(ticket.id, e)}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-600"
                      />
                    </td>

                    {/* ID */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-indigo-400 group-hover:underline">
                        {ticket.id}
                      </span>
                    </td>

                    {/* Subject */}
                    <td className="py-3.5 px-4 min-w-[280px] max-w-sm">
                      <div className="truncate font-medium text-white group-hover:text-indigo-300 transition-colors">
                        {ticket.subject}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 truncate text-[11px] text-slate-400">
                        {ticket.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{customer?.name || ticket.customerId}</div>
                      <div className="text-[10px] text-slate-400 truncate">{customer?.company}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-slate-300">
                      {ticket.category}
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={ticket.priority} />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={ticket.status} />
                    </td>

                    {/* Assignee */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span className={ticket.assignedAgentId ? 'text-slate-200' : 'text-slate-500 italic'}>
                          {agentName}
                        </span>
                      </div>
                    </td>

                    {/* Created At */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {formatRelativeTime(ticket.createdAt)}
                    </td>

                    {/* SLA State & Countdown */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <SlaBadge state={ticket.slaState} />
                        {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                          <span
                            className={`font-mono text-[10px] ${
                              remaining.isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'
                            }`}
                          >
                            {remaining.text}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing <span className="font-semibold text-white">{(currentPage - 1) * pageSize + 1}</span> to{' '}
          <span className="font-semibold text-white">
            {Math.min(currentPage * pageSize, sortedTickets.length)}
          </span>{' '}
          of <span className="font-semibold text-white">{sortedTickets.length}</span> tickets
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono text-xs">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
