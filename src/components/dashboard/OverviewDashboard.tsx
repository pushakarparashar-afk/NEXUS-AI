import React from 'react';
import { motion } from 'framer-motion';
import {
  Inbox,
  UserX,
  Flame,
  ShieldCheck,
  Clock,
  Sparkles,
  Download,
  Plus,
  TrendingUp,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MetricCard } from './MetricCard';
import { VolumeChart } from './VolumeChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { AgentWorkloadChart } from './AgentWorkloadChart';
import { UrgentTicketsList } from './UrgentTicketsList';
import { ActivityFeed } from './ActivityFeed';
import { Button } from '@/components/common/Button';
import { exportAnalyticsToCsv } from '@/lib/csv';
import { TimeRangeFilter } from '@/types';

export const OverviewDashboard: React.FC = () => {
  const {
    tickets,
    customers,
    agents,
    activities,
    aiFeedback,
    timeRange,
    setTimeRange,
    setIsCreateTicketOpen,
    setSelectedTicket,
  } = useApp();

  // Mathematical computations based on real application state
  const totalOpenTickets = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;
  const unassignedTickets = tickets.filter(t => !t.assignedAgentId && t.status !== 'resolved' && t.status !== 'closed').length;
  const criticalTickets = tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed').length;

  // SLA Compliance Rate = (eligible tickets meeting SLA / total tickets with outcome) * 100
  const completedSlaTickets = tickets.filter(t => t.slaState === 'met' || t.slaState === 'breached');
  const metSlaTickets = completedSlaTickets.filter(t => t.slaState === 'met').length;
  const slaComplianceRate = completedSlaTickets.length > 0
    ? Math.round((metSlaTickets / completedSlaTickets.length) * 100)
    : 96;

  // Average Resolution Time (in hours) for resolved tickets
  const resolvedTickets = tickets.filter(t => t.resolvedAt);
  const avgResolutionHours = resolvedTickets.length > 0
    ? (
        resolvedTickets.reduce((acc, t) => {
          const diff = new Date(t.resolvedAt!).getTime() - new Date(t.createdAt).getTime();
          return acc + diff / (1000 * 3600);
        }, 0) / resolvedTickets.length
      ).toFixed(1)
    : '4.8';

  // AI Recommendation Acceptance Rate = accepted / (accepted + rejected) * 100
  const recordedDecisions = aiFeedback.filter(fb => fb.decision === 'accepted' || fb.decision === 'rejected');
  const acceptedDecisions = recordedDecisions.filter(fb => fb.decision === 'accepted').length;
  const aiAcceptanceRate = recordedDecisions.length > 0
    ? Math.round((acceptedDecisions / recordedDecisions.length) * 100)
    : 88;

  const handleExportReport = () => {
    exportAnalyticsToCsv({
      'Total Open Tickets': totalOpenTickets,
      'Unassigned Tickets': unassignedTickets,
      'Critical P1 Tickets': criticalTickets,
      'SLA Compliance Rate (%)': slaComplianceRate,
      'Average Resolution Time (Hours)': avgResolutionHours,
      'AI Recommendation Acceptance Rate (%)': aiAcceptanceRate,
      'Generated Date': new Date().toISOString(),
    });
  };

  const currentDateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{currentDateFormatted}</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400">Real-Time Sync Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Support Operations Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Unified incident management, Agentforce AI orchestration, priority routing, and real-time SLA deadline monitoring.
          </p>
        </div>

        {/* Time Range Selector & Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Selector */}
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

          <Button variant="outline" size="sm" onClick={handleExportReport} className="text-xs">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => setIsCreateTicketOpen(true)} className="text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>New Ticket</span>
          </Button>
        </div>
      </div>

      {/* 6 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Open Tickets"
          value={totalOpenTickets}
          changePercent={-6.2}
          changeLabel="vs last week"
          sparklineData={[18, 22, 21, 25, 23, 20, totalOpenTickets]}
          icon={Inbox}
          iconColor="text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
          sparklineColor="#6366f1"
          tooltipText="All tickets currently in New, Open, or In-Progress status."
        />

        <MetricCard
          title="Unassigned Tickets"
          value={unassignedTickets}
          changePercent={-14.3}
          changeLabel="improved triage"
          sparklineData={[6, 8, 5, 4, 3, 4, unassignedTickets]}
          icon={UserX}
          iconColor="text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
          sparklineColor="#06b6d4"
          tooltipText="Tickets awaiting assignment to a specific support agent or queue."
          inverseTrend
        />

        <MetricCard
          title="Critical Incidents"
          value={criticalTickets}
          changePercent={criticalTickets > 2 ? 25.0 : -33.3}
          changeLabel="severity P1 count"
          sparklineData={[4, 5, 3, 2, 4, 3, criticalTickets]}
          icon={Flame}
          iconColor="text-rose-400 bg-rose-500/10 border-rose-500/20"
          sparklineColor="#f43f5e"
          tooltipText="P1 Critical severity incidents with urgent first response targets."
          inverseTrend
        />

        <MetricCard
          title="SLA Compliance"
          value={`${slaComplianceRate}%`}
          changePercent={3.4}
          changeLabel="vs target (95%)"
          sparklineData={[92, 94, 91, 95, 96, 97, slaComplianceRate]}
          icon={ShieldCheck}
          iconColor="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          sparklineColor="#10b981"
          tooltipText="Percentage of completed tickets meeting both First Response and Resolution SLAs."
        />

        <MetricCard
          title="Avg Resolution Time"
          value={`${avgResolutionHours}h`}
          changePercent={-8.5}
          changeLabel="faster resolution"
          sparklineData={[7.2, 6.8, 6.1, 5.5, 5.2, 4.9, parseFloat(avgResolutionHours)]}
          icon={Clock}
          iconColor="text-amber-400 bg-amber-500/10 border-amber-500/20"
          sparklineColor="#f59e0b"
          tooltipText="Mean calendar time required from ticket creation to resolved status."
          inverseTrend
        />

        <MetricCard
          title="AI Acceptance Rate"
          value={`${aiAcceptanceRate}%`}
          changePercent={5.1}
          changeLabel="operator confidence"
          sparklineData={[75, 78, 82, 80, 85, 87, aiAcceptanceRate]}
          icon={Sparkles}
          iconColor="text-violet-400 bg-violet-500/10 border-violet-500/20"
          sparklineColor="#8b5cf6"
          tooltipText="Percentage of AI suggestions accepted by operators without rejection."
        />
      </div>

      {/* Primary Visualizations Row: Ticket Volume Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volume Over Time Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Ticket Volume Ingestion & Resolution Trend</h3>
              <p className="text-xs text-slate-400">Comparing created tickets vs completed resolutions over selected period</p>
            </div>
          </div>
          <VolumeChart tickets={tickets} timeRange={timeRange} />
        </div>

        {/* Category Breakdown Donut */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Category Distribution</h3>
              <p className="text-xs text-slate-400">Breakdown of support cases by domain</p>
            </div>
          </div>
          <CategoryBreakdown tickets={tickets} />
        </div>
      </div>

      {/* Secondary Operational Row: Urgent Tickets Queue & Operational Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent & At-Risk Tickets Queue */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-semibold text-white">Urgent Incident & SLA Watchlist</h3>
            </div>
            <span className="text-xs text-slate-400">Prioritized by deadline urgency</span>
          </div>
          <UrgentTicketsList
            tickets={tickets}
            agents={agents}
            customers={customers}
            onSelectTicket={setSelectedTicket}
          />
        </div>

        {/* Real-Time Operational Activity Stream */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Operational Activity Stream</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>
          <ActivityFeed activities={activities} maxItems={6} />
        </div>
      </div>

      {/* Third Operational Row: Agent Workload & Capacity */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
          <div>
            <h3 className="text-sm font-semibold text-white">Support Agent Workload & Performance Comparison</h3>
            <p className="text-xs text-slate-400">Current assigned ticket load versus completed resolutions</p>
          </div>
        </div>
        <AgentWorkloadChart agents={agents} tickets={tickets} />
      </div>
    </div>
  );
};
