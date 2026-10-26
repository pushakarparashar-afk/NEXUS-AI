import React from 'react';
import { CircleDot, PlayCircle, Loader2, UserCheck, CheckCircle2, Archive } from 'lucide-react';
import { TicketStatus } from '@/types';
import { Badge } from '@/components/common/Badge';

interface StatusBadgeProps {
  status: TicketStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    new: {
      label: 'New',
      variant: 'cyan' as const,
      icon: CircleDot,
    },
    open: {
      label: 'Open',
      variant: 'primary' as const,
      icon: PlayCircle,
    },
    in_progress: {
      label: 'In Progress',
      variant: 'violet' as const,
      icon: Loader2,
    },
    waiting_customer: {
      label: 'Waiting Customer',
      variant: 'warning' as const,
      icon: UserCheck,
    },
    resolved: {
      label: 'Resolved',
      variant: 'success' as const,
      icon: CheckCircle2,
    },
    closed: {
      label: 'Closed',
      variant: 'neutral' as const,
      icon: Archive,
    },
  }[status];

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} size="sm">
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </Badge>
  );
};
