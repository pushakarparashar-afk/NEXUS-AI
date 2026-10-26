import React from 'react';
import { ActivityEvent } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import {
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

interface ActivityFeedProps {
  activities: ActivityEvent[];
  maxItems?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, maxItems = 6 }) => {
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
        return <RefreshCw className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const displayList = activities.slice(0, maxItems);

  return (
    <div className="space-y-3">
      {displayList.map(act => (
        <div key={act.id} className="flex items-start gap-3 text-xs">
          <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 flex-shrink-0 mt-0.5">
            {getIcon(act.eventType)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-200 truncate">{act.actor}</span>
              <span className="text-[10px] text-slate-500 flex-shrink-0 font-mono">
                {formatRelativeTime(act.timestamp)}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">{act.description}</p>
            {act.ticketId && (
              <span className="inline-block mt-1 text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                {act.ticketId}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
