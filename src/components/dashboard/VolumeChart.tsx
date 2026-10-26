import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Ticket } from '@/types';

interface VolumeChartProps {
  tickets: Ticket[];
  timeRange: string;
}

export const VolumeChart: React.FC<VolumeChartProps> = ({ tickets, timeRange }) => {
  // Aggregate real ticket data into time buckets
  const days = timeRange === 'today' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

  const data = React.useMemo(() => {
    const buckets: { [key: string]: { date: string; created: number; resolved: number; critical: number } } = {};
    const now = new Date();

    const pointsCount = timeRange === 'today' ? 12 : Math.min(days, 14);

    for (let i = pointsCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * (days / pointsCount) * 86400 * 1000);
      const label = timeRange === 'today'
        ? `${d.getHours()}:00`
        : `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      buckets[label] = { date: label, created: 0, resolved: 0, critical: 0 };
    }

    const bucketKeys = Object.keys(buckets);

    // Distribute actual tickets into buckets
    tickets.forEach(t => {
      const createdDate = new Date(t.createdAt);
      const resolvedDate = t.resolvedAt ? new Date(t.resolvedAt) : null;

      const createdLabel = timeRange === 'today'
        ? `${createdDate.getHours()}:00`
        : `${createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

      if (buckets[createdLabel]) {
        buckets[createdLabel].created += 1;
        if (t.priority === 'critical') {
          buckets[createdLabel].critical += 1;
        }
      } else if (bucketKeys.length > 0) {
        // distribute to nearest
        buckets[bucketKeys[bucketKeys.length - 1]].created += 1;
        if (t.priority === 'critical') {
          buckets[bucketKeys[bucketKeys.length - 1]].critical += 1;
        }
      }

      if (resolvedDate) {
        const resolvedLabel = timeRange === 'today'
          ? `${resolvedDate.getHours()}:00`
          : `${resolvedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        if (buckets[resolvedLabel]) {
          buckets[resolvedLabel].resolved += 1;
        } else if (bucketKeys.length > 0) {
          buckets[bucketKeys[bucketKeys.length - 1]].resolved += 1;
        }
      }
    });

    return Object.values(buckets);
  }, [tickets, timeRange, days]);

  return (
    <div className="h-64 sm:h-72 w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
          <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '0.75rem',
              color: '#f8fafc',
              fontSize: '12px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            iconType="circle"
          />
          <Area
            type="monotone"
            name="Tickets Ingested"
            dataKey="created"
            stroke="#6366f1"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#createdGrad)"
          />
          <Area
            type="monotone"
            name="Tickets Resolved"
            dataKey="resolved"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#resolvedGrad)"
          />
          <Area
            type="monotone"
            name="Critical Incidents"
            dataKey="critical"
            stroke="#f43f5e"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#criticalGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
