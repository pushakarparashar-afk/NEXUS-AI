import React from 'react';
import { Flame, ArrowUpCircle, ArrowRightCircle, ArrowDownCircle } from 'lucide-react';
import { TicketPriority } from '@/types';
import { Badge } from '@/components/common/Badge';

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const config = {
    critical: {
      label: 'Critical',
      variant: 'danger' as const,
      icon: Flame,
    },
    high: {
      label: 'High',
      variant: 'warning' as const,
      icon: ArrowUpCircle,
    },
    medium: {
      label: 'Medium',
      variant: 'primary' as const,
      icon: ArrowRightCircle,
    },
    low: {
      label: 'Low',
      variant: 'neutral' as const,
      icon: ArrowDownCircle,
    },
  }[priority];

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} size="sm">
      <Icon className="w-3 h-3" />
      <span className="capitalize">{config.label}</span>
    </Badge>
  );
};
