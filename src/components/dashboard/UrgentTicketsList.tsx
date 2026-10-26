import React from 'react';
import { AlertCircle, Flame, ArrowRight, User } from 'lucide-react';
import { Ticket, SupportAgent, Customer } from '@/types';
import { PriorityBadge } from '@/components/tickets/PriorityBadge';
import { SlaBadge } from '@/components/tickets/SlaBadge';
import { formatTimeRemaining } from '@/lib/utils';

interface UrgentTicketsListProps {
  tickets: Ticket[];
  agents: SupportAgent[];
  customers: Customer[];
  onSelectTicket: (ticket: Ticket) => void;
}

export const UrgentTicketsList: React.FC<UrgentTicketsListProps> = ({
  tickets,
  agents,
  customers,
  onSelectTicket,
}) => {
  const agentMap = new Map(agents.map(a => [a.id, a.name]));
  const customerMap = new Map(customers.map(c => [c.id, c.name]));

  // Urgent tickets: Critical priority, or SLA At-Risk, or SLA Breached (and not yet resolved/closed)
  const urgentTickets = tickets
    .filter(
      t =>
        t.status !== 'resolved' &&
        t.status !== 'closed' &&
        (t.priority === 'critical' || t.slaState === 'at_risk' || t.slaState === 'breached')
    )
    .sort((a, b) => {
      // Prioritize breached first, then at_risk, then critical
      const order = { breached: 3, at_risk: 2, on_track: 1, met: 0, paused: 0 };
      return (order[b.slaState] || 0) - (order[a.slaState] || 0);
    })
    .slice(0, 5);

  return (
    <div className="space-y-2.5">
      {urgentTickets.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
          No urgent SLA breaches or critical tickets at this time.
        </div>
      ) : (
        urgentTickets.map(t => {
          const remaining = formatTimeRemaining(t.resolutionDeadline);
          const customerName = customerMap.get(t.customerId) || 'Customer';
          const agentName = t.assignedAgentId ? agentMap.get(t.assignedAgentId) || 'Unassigned' : 'Unassigned';

          return (
            <div
              key={t.id}
              onClick={() => onSelectTicket(t)}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-850/80 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-200"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-400">{t.id}</span>
                  <PriorityBadge priority={t.priority} />
                  <SlaBadge state={t.slaState} />
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                  {t.subject}
                </h4>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="truncate">{customerName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <User className="w-3 h-3 text-slate-500" />
                    {agentName}
                  </span>
                </div>
              </div>

              {/* Deadline & Arrow */}
              <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                <div className="text-left sm:text-right">
                  <div
                    className={`text-xs font-mono font-bold ${
                      remaining.isOverdue ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  >
                    {remaining.text}
                  </div>
                  <div className="text-[10px] text-slate-500">Resolution SLA</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
