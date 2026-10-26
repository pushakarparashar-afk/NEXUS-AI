import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { SupportAgent, Ticket } from '@/types';

interface AgentWorkloadChartProps {
  agents: SupportAgent[];
  tickets: Ticket[];
}

export const AgentWorkloadChart: React.FC<AgentWorkloadChartProps> = ({ agents, tickets }) => {
  const data = React.useMemo(() => {
    return agents.map(a => {
      const activeTickets = tickets.filter(t => t.assignedAgentId === a.id && t.status !== 'resolved' && t.status !== 'closed');
      const resolvedTickets = tickets.filter(t => t.assignedAgentId === a.id && (t.status === 'resolved' || t.status === 'closed'));

      return {
        name: a.name.split(' ')[0], // First name for compact display
        active: activeTickets.length,
        resolved: resolvedTickets.length,
        slaRate: a.slaAttainmentRate,
      };
    });
  }, [agents, tickets]);

  return (
    <div className="h-64 sm:h-72 w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
          <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '0.75rem',
              color: '#f8fafc',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
          <Bar name="Active Workload" dataKey="active" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar name="Resolved Tickets" dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
