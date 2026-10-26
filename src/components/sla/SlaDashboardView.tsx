import React, { useState } from 'react';
import {
  ClockAlert,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Sliders,
  Save,
  RotateCcw,
  PauseCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SlaPolicy, SlaState } from '@/types';
import { SlaBadge } from '@/components/tickets/SlaBadge';
import { PriorityBadge } from '@/components/tickets/PriorityBadge';
import { Button } from '@/components/common/Button';
import { formatDate, formatTimeRemaining } from '@/lib/utils';

export const SlaDashboardView: React.FC = () => {
  const { tickets, slaPolicies, updateSlaPolicy, setSelectedTicket } = useApp();

  const [editingPolicy, setEditingPolicy] = useState<SlaPolicy | null>(null);

  // Compute breakdown by SLA state
  const stateCounts: Record<SlaState, number> = {
    on_track: 0,
    at_risk: 0,
    breached: 0,
    met: 0,
    paused: 0,
  };

  tickets.forEach(t => {
    stateCounts[t.slaState] = (stateCounts[t.slaState] || 0) + 1;
  });

  const totalCompleted = stateCounts.met + stateCounts.breached;
  const compliancePct = totalCompleted > 0 ? Math.round((stateCounts.met / totalCompleted) * 100) : 96;

  // Active breached & at-risk tickets
  const breachedTickets = tickets.filter(t => t.slaState === 'breached');
  const atRiskTickets = tickets.filter(t => t.slaState === 'at_risk');

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;
    updateSlaPolicy(editingPolicy);
    setEditingPolicy(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClockAlert className="w-5 h-5 text-indigo-400" />
            <h1 className="text-2xl font-extrabold text-white">SLA Monitoring Engine & Policies</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time compliance tracking, early at-risk warning triggers, and configurable target matrices by priority.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 p-3 rounded-2xl">
          <div className="text-right">
            <div className="text-xs text-slate-400">Global Compliance</div>
            <div className="text-2xl font-extrabold text-emerald-400">{compliancePct}%</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SLA State Health Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/20 space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>On Track</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">{stateCounts.on_track}</div>
          <p className="text-[10px] text-slate-400">Healthy within target buffer</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/20 space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span>At Risk</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">{stateCounts.at_risk}</div>
          <p className="text-[10px] text-slate-400">&gt; 75% elapsed or &lt; 45m left</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/20 space-y-1">
          <div className="flex items-center justify-between text-xs text-rose-400 font-semibold">
            <span>Breached</span>
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">{stateCounts.breached}</div>
          <p className="text-[10px] text-slate-400">Missed target deadline</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/20 space-y-1">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold">
            <span>Met Target</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">{stateCounts.met}</div>
          <p className="text-[10px] text-slate-400">Successfully resolved in SLA</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Paused</span>
            <PauseCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">{stateCounts.paused}</div>
          <p className="text-[10px] text-slate-400">Waiting for customer response</p>
        </div>
      </div>

      {/* Policy Configuration Matrix */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Configured SLA Policy Matrix</h3>
            <p className="text-xs text-slate-400">Configured response and resolution thresholds by priority</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Priority Level</th>
                <th className="py-3 px-4">First Response Target</th>
                <th className="py-3 px-4">Resolution Target</th>
                <th className="py-3 px-4">Calculation Mode</th>
                <th className="py-3 px-4">At-Risk Threshold</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {slaPolicies.map(policy => (
                <tr key={policy.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <PriorityBadge priority={policy.priority} />
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {policy.firstResponseMinutes / 60} hour(s) ({policy.firstResponseMinutes} mins)
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {policy.resolutionMinutes / 60} hour(s) ({policy.resolutionMinutes} mins)
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {policy.businessHoursOnly ? 'Business Hours (9am-5pm)' : 'Calendar Hours (24/7)'}
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-400">
                    {policy.atRiskThresholdPercent}% elapsed
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setEditingPolicy(policy)}
                    >
                      <Sliders className="w-3.5 h-3.5 mr-1" />
                      Configure
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Policy Edit Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleSavePolicy}
            className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-4 text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                Edit SLA Policy: {editingPolicy.priority.toUpperCase()}
              </h3>
              <PriorityBadge priority={editingPolicy.priority} />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  First Response Target (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="10080"
                  value={editingPolicy.firstResponseMinutes}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, firstResponseMinutes: parseInt(e.target.value) || 60 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Resolution Target (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="20160"
                  value={editingPolicy.resolutionMinutes}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, resolutionMinutes: parseInt(e.target.value) || 240 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  At-Risk Warning Threshold (% elapsed)
                </label>
                <input
                  type="number"
                  min="50"
                  max="95"
                  value={editingPolicy.atRiskThresholdPercent}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, atRiskThresholdPercent: parseInt(e.target.value) || 75 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="businessHoursToggle"
                  checked={editingPolicy.businessHoursOnly}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, businessHoursOnly: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-600"
                />
                <label htmlFor="businessHoursToggle" className="text-slate-300 cursor-pointer">
                  Count elapsed time only during business hours (9:00 AM - 5:00 PM Mon-Fri)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingPolicy(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Breached & At Risk Incident Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breached SLA Tickets */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-rose-500/30 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Active SLA Breaches ({breachedTickets.length})
              </h3>
            </div>
          </div>

          <div className="space-y-2">
            {breachedTickets.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-rose-500/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-indigo-400 font-bold">{t.id}</span>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <h4 className="font-medium text-white truncate max-w-xs mt-1">{t.subject}</h4>
                </div>
                <div className="text-right">
                  <span className="text-rose-400 font-mono font-bold">
                    {formatTimeRemaining(t.resolutionDeadline).text}
                  </span>
                  <div className="text-[10px] text-slate-500">Overdue</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* At-Risk SLA Tickets */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                At-Risk Threshold Queue ({atRiskTickets.length})
              </h3>
            </div>
          </div>

          <div className="space-y-2">
            {atRiskTickets.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-indigo-400 font-bold">{t.id}</span>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <h4 className="font-medium text-white truncate max-w-xs mt-1">{t.subject}</h4>
                </div>
                <div className="text-right">
                  <span className="text-amber-400 font-mono font-bold">
                    {formatTimeRemaining(t.resolutionDeadline).text}
                  </span>
                  <div className="text-[10px] text-slate-500">Time Left</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
