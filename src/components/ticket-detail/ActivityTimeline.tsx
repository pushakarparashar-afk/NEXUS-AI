import React from 'react';
import { ActivityEvent } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Clock,
  PlusCircle,
  RefreshCw,
  Flame,
  UserCheck,
  AlertTriangle,
  Sparkles,
  MessageSquare,
  CheckCircle,
  Cpu,
} from 'lucide-react';

interface ActivityTimelineProps {
  activities: ActivityEvent[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const getIcon = (type: ActivityEvent['eventType']) => {
    switch (type) {
      case 'created':
        return <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />;
      case 'status_changed':
        return <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />;
      case 'priority_changed':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'assigned':
      case 'reassigned':
        return <UserCheck className="w-3.5 h-3.5 text-violet-400" />;
      case 'sla_breached':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      case 'ai_applied':
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
      case 'reply_sent':
      case 'note_added':
        return <MessageSquare className="w-3.5 h-3.5 text-slate-400" />;
      case 'resolved':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
      case 'rule_executed':
        return <Cpu className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-500 italic">
        No recorded activity events for this ticket.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 text-xs text-slate-200">
      {activities.map((act) => (
        <div key={act.id} className="relative group">
          {/* Timeline Node Bullet */}
          <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
            {getIcon(act.eventType)}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-100">{act.actor}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {formatDate(act.timestamp)}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">{act.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
