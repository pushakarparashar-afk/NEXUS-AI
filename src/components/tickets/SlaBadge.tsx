import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Clock, PauseCircle } from 'lucide-react';
import { SlaState } from '@/types';
import { Badge } from '@/components/common/Badge';

interface SlaBadgeProps {
  state: SlaState;
  showIcon?: boolean;
}

export const SlaBadge: React.FC<SlaBadgeProps> = ({ state, showIcon = true }) => {
  const config = {
    on_track: {
      label: 'On Track',
      variant: 'success' as const,
      icon: Clock,
    },
    at_risk: {
      label: 'At Risk',
      variant: 'warning' as const,
      icon: AlertTriangle,
    },
    breached: {
      label: 'Breached',
      variant: 'danger' as const,
      icon: AlertOctagon,
    },
    met: {
      label: 'SLA Met',
      variant: 'cyan' as const,
      icon: CheckCircle2,
    },
    paused: {
      label: 'Paused',
      variant: 'neutral' as const,
      icon: PauseCircle,
    },
  }[state];

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} size="sm">
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{config.label}</span>
    </Badge>
  );
};
