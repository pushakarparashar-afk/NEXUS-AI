import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlertOctagon, CheckCircle2, PauseCircle } from 'lucide-react';
import { Ticket, SlaState } from '@/types';
import { formatTimeRemaining, formatDate } from '@/lib/utils';
import { SlaBadge } from '@/components/tickets/SlaBadge';

interface SlaCountdownWidgetProps {
  ticket: Ticket;
}

export const SlaCountdownWidget: React.FC<SlaCountdownWidgetProps> = ({ ticket }) => {
  const [resolutionTime, setResolutionTime] = useState(() => formatTimeRemaining(ticket.resolutionDeadline));
  const [firstRespTime, setFirstRespTime] = useState(() => formatTimeRemaining(ticket.firstResponseDeadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setResolutionTime(formatTimeRemaining(ticket.resolutionDeadline));
      setFirstRespTime(formatTimeRemaining(ticket.firstResponseDeadline));
    }, 10000);
    return () => clearInterval(timer);
  }, [ticket.resolutionDeadline, ticket.firstResponseDeadline]);

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-3 text-xs text-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>SLA Tracking Engine</span>
        </div>
        <SlaBadge state={ticket.slaState} />
      </div>

      <div className="space-y-2.5 pt-1">
        {/* First Response SLA */}
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-400">First Response Target</span>
            {ticket.firstResponseAt ? (
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Responded
              </span>
            ) : (
              <span className={`text-[11px] font-mono font-bold ${firstRespTime.isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
                {firstRespTime.text}
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Deadline: {formatDate(ticket.firstResponseDeadline)}
          </div>
        </div>

        {/* Resolution SLA */}
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-400">Resolution Target</span>
            {ticket.resolvedAt ? (
              <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Resolved
              </span>
            ) : (
              <span className={`text-[11px] font-mono font-bold ${resolutionTime.isOverdue ? 'text-rose-400' : 'text-amber-400'}`}>
                {resolutionTime.text}
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Deadline: {formatDate(ticket.resolutionDeadline)}
          </div>
        </div>
      </div>
    </div>
  );
};
