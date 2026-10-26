import React from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  ThumbsDown,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useApp } from '@/context/AppContext';
import { exportAnalyticsToCsv } from '@/lib/csv';
import { Button } from '@/components/common/Button';
import { TimeRangeFilter } from '@/types';

export const AnalyticsView: React.FC = () => {
  const { tickets, agents, aiFeedback, timeRange, setTimeRange } = useApp();

  // Metrics calculation
  const totalTickets = tickets.length;
  const openCount = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  // SLA attainment
  const completedSla = tickets.filter(t => t.slaState === 'met' || t.slaState === 'breached');
  const metSla = completedSla.filter(t => t.slaState === 'met').length;
  const slaAttainment = completedSla.length > 0 ? Math.round((metSla / completedSla.length) * 100) : 96;

  // AI Acceptance Rate
  const feedbackDecisions = aiFeedback.filter(f => f.decision === 'accepted' || f.decision === 'rejected');
  const acceptedFeedback = feedbackDecisions.filter(f => f.decision === 'accepted').length;
  const aiAcceptanceRate = feedbackDecisions.length > 0 ? Math.round((acceptedFeedback / feedbackDecisions.length) * 100) : 88;

  // Priority distribution data
  const priorityData = React.useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    tickets.forEach(t => {
      counts[t.priority] = (counts[t.priority] || 0) + 1;
    });
    return [
      { name: 'Critical', count: counts.critical, color: '#f43f5e' },
      { name: 'High', count: counts.high, color: '#f59e0b' },
      { name: 'Medium', count: counts.medium, color: '#6366f1' },
      { name: 'Low', count: counts.low, color: '#64748b' },
    ];
  }, [tickets]);

  // SLA breaches by team data
  const breachesByTeamData = React.useMemo(() => {
    const teamBreaches: { [team: string]: number } = {};
    const agentTeamMap = new Map(agents.map(a => [a.id, a.team]));

    tickets.filter(t => t.slaState === 'breached').forEach(t => {
      const team = t.assignedAgentId ? agentTeamMap.get(t.assignedAgentId) || 'Unassigned Queue' : 'Unassigned Queue';
      teamBreaches[team] = (teamBreaches[team] || 0) + 1;
    });

    if (Object.keys(teamBreaches).length === 0) {
      teamBreaches['Tier 3 / Critical Escalations'] = 0;
      teamBreaches['Billing & Account Services'] = 0;
    }

    return Object.entries(teamBreaches).map(([team, count]) => ({
      team: team.replace('Operations', 'Ops').slice(0, 24),
      breaches: count,
    }));
  }, [tickets, agents]);

  // Rejection reasons breakdown
  const rejectionReasons = aiFeedback
    .filter(f => f.decision === 'rejected' && f.rejectionReason)
    .map(f => f.rejectionReason!);

  const handleExport = () => {
    exportAnalyticsToCsv({
      'Total Tickets': totalTickets,
      'Open Tickets': openCount,
      'Resolved Tickets': resolvedCount,
      'SLA Attainment (%)': slaAttainment,
      'AI Recommendation Acceptance (%)': aiAcceptanceRate,
      'Critical Tickets': priorityData.find(p => p.name === 'Critical')?.count || 0,
      'Time Range Filter': timeRange,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h1 className="text-2xl font-extrabold text-white">Operational Analytics & SLA Insights</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Audit trends, queue throughput, team workload equilibrium, and AI assistance accuracy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Filter */}
          <div className="bg-slate-950 border border-slate-800 p-1 rounded-xl flex items-center text-xs">
            {(['today', '7d', '30d', '90d'] as TimeRangeFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  timeRange === r
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === 'today' ? 'Today' : r.toUpperCase()}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={handleExport} className="text-xs">
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics CSV</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Open vs Resolved</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {openCount} <span className="text-sm font-normal text-slate-500">/ {resolvedCount} resolved</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Throughput ratio: {(resolvedCount / (totalTickets || 1) * 100).toFixed(0)}%</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>SLA Attainment Target</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{slaAttainment}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Goal: 95% threshold</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>AI Acceptance Rate</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">{aiAcceptanceRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Recorded decisions: {feedbackDecisions.length}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Avg First Response</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">42 min</div>
          <div className="text-[11px] text-slate-500 mt-1">P1 Target: 60 min</div>
        </div>
      </div>

      {/* Visual Charts Row: Priority Distribution & SLA Breaches by Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white">Tickets Distribution by Priority Severity</h3>
            <p className="text-xs text-slate-400">Operational load by SLA priority tier</p>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Breaches by Support Team */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white">SLA Breaches Breakdown by Assigned Team</h3>
            <p className="text-xs text-slate-400">Monitoring queues requiring additional staffing</p>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breachesByTeamData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="team" type="category" stroke="#64748b" fontSize={10} tickLine={false} width={130} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="breaches" fill="#f43f5e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Recommendation Rejection Log */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <ThumbsDown className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">AI Copilot Recommendation Rejection Reasons</h3>
        </div>
        {rejectionReasons.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 italic">
            No rejected recommendations recorded in this period.
          </div>
        ) : (
          <div className="space-y-2">
            {rejectionReasons.map((reason, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
