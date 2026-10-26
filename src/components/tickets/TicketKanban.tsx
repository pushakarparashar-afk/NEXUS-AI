import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, User, Clock, AlertTriangle } from 'lucide-react';
import { Ticket, TicketStatus, SupportAgent, Customer } from '@/types';
import { PriorityBadge } from './PriorityBadge';
import { SlaBadge } from './SlaBadge';
import { formatTimeRemaining } from '@/lib/utils';

interface TicketKanbanProps {
  tickets: Ticket[];
  agents: SupportAgent[];
  customers: Customer[];
  onSelectTicket: (ticket: Ticket) => void;
  onUpdateStatus: (ticketId: string, status: TicketStatus) => void;
}

const COLUMNS: { id: TicketStatus; label: string; color: string }[] = [
  { id: 'new', label: 'New', color: 'border-cyan-500/40 text-cyan-400' },
  { id: 'open', label: 'Open', color: 'border-indigo-500/40 text-indigo-400' },
  { id: 'in_progress', label: 'In Progress', color: 'border-violet-500/40 text-violet-400' },
  { id: 'waiting_customer', label: 'Waiting Customer', color: 'border-amber-500/40 text-amber-400' },
  { id: 'resolved', label: 'Resolved', color: 'border-emerald-500/40 text-emerald-400' },
];

export const TicketKanban: React.FC<TicketKanbanProps> = ({
  tickets,
  agents,
  customers,
  onSelectTicket,
  onUpdateStatus,
}) => {
  const agentMap = new Map(agents.map(a => [a.id, a.name]));
  const customerMap = new Map(customers.map(c => [c.id, c.name]));

  const getNextStatus = (current: TicketStatus): TicketStatus | null => {
    switch (current) {
      case 'new': return 'open';
      case 'open': return 'in_progress';
      case 'in_progress': return 'resolved';
      case 'waiting_customer': return 'in_progress';
      case 'resolved': return 'closed';
      default: return null;
    }
  };

  const getPrevStatus = (current: TicketStatus): TicketStatus | null => {
    switch (current) {
      case 'open': return 'new';
      case 'in_progress': return 'open';
      case 'waiting_customer': return 'in_progress';
      case 'resolved': return 'in_progress';
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map(col => {
        const colTickets = tickets.filter(t => t.status === col.id);

        return (
          <div
            key={col.id}
            className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-3 flex flex-col min-w-[260px] max-h-[750px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80 px-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                  {col.label}
                </span>
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono font-bold">
                  {colTickets.length}
                </span>
              </div>
            </div>

            {/* Cards List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {colTickets.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 italic">
                  No tickets in this stage
                </div>
              ) : (
                colTickets.map(ticket => {
                  const remaining = formatTimeRemaining(ticket.resolutionDeadline);
                  const agentName = ticket.assignedAgentId ? agentMap.get(ticket.assignedAgentId) || 'Unassigned' : 'Unassigned';
                  const nextStatus = getNextStatus(ticket.status);
                  const prevStatus = getPrevStatus(ticket.status);

                  return (
                    <motion.div
                      key={ticket.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/80 transition-all shadow-md group cursor-pointer text-slate-100 space-y-2.5"
                      onClick={() => onSelectTicket(ticket)}
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs font-bold text-indigo-400">
                          {ticket.id}
                        </span>
                        <PriorityBadge priority={ticket.priority} />
                      </div>

                      {/* Subject */}
                      <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 line-clamp-2 leading-snug">
                        {ticket.subject}
                      </h4>

                      {/* Customer & Category */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate">{customerMap.get(ticket.customerId) || 'Customer'}</span>
                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                          {ticket.category.split(' ')[0]}
                        </span>
                      </div>

                      {/* SLA Badge & Assignee */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                        <SlaBadge state={ticket.slaState} showIcon={false} />
                        <div className="flex items-center gap-1 text-slate-400 truncate max-w-[110px]">
                          <User className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{agentName}</span>
                        </div>
                      </div>

                      {/* Quick Kanban Column Progression Buttons */}
                      <div
                        className="flex items-center justify-between pt-1 border-t border-slate-800/40 text-[10px] text-slate-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {prevStatus ? (
                          <button
                            onClick={() => onUpdateStatus(ticket.id, prevStatus)}
                            className="flex items-center gap-0.5 hover:text-white hover:bg-slate-700/50 px-1.5 py-0.5 rounded transition-colors"
                            title={`Move back to ${prevStatus}`}
                          >
                            <ChevronLeft className="w-3 h-3" />
                            <span>Back</span>
                          </button>
                        ) : <span />}

                        {nextStatus ? (
                          <button
                            onClick={() => onUpdateStatus(ticket.id, nextStatus)}
                            className="flex items-center gap-0.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-1.5 py-0.5 rounded font-semibold transition-colors ml-auto"
                            title={`Advance to ${nextStatus}`}
                          >
                            <span>Advance</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-emerald-400 font-bold">Complete</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
