import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Ticket } from '@/types';

interface CategoryBreakdownProps {
  tickets: Ticket[];
}

const CATEGORY_COLORS: { [key: string]: string } = {
  'Technical Support': '#6366f1',
  'Billing & Payments': '#3b82f6',
  'Account Access': '#06b6d4',
  'Product Issue': '#8b5cf6',
  'Security': '#f43f5e',
  'Delivery & Orders': '#f59e0b',
  'Other': '#64748b',
};

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ tickets }) => {
  const data = React.useMemo(() => {
    const counts: { [cat: string]: number } = {};
    tickets.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || '#6366f1',
      percent: Math.round((value / (tickets.length || 1)) * 100),
    })).sort((a, b) => b.value - a.value);
  }, [tickets]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-64 sm:h-72 w-full pt-2">
      {/* Donut Chart */}
      <div className="h-44 sm:h-52 w-44 sm:w-52 relative flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.5rem',
                color: '#f8fafc',
                fontSize: '11px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center Total Count Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-extrabold text-white">{tickets.length}</span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Tickets</span>
        </div>
      </div>

      {/* Breakdown Legend List */}
      <div className="flex-1 w-full space-y-2 overflow-y-auto max-h-52 pr-1">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300 truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="font-mono text-slate-400">{item.value}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                {item.percent}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
