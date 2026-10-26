import React from 'react';
import {
  UserCheck,
  Shield,
  CheckCircle2,
  Inbox,
  Award,
  Layers,
  Clock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SupportAgent } from '@/types';

export const AgentDirectoryView: React.FC = () => {
  const { agents, tickets } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <h1 className="text-2xl font-extrabold text-white">Support Agent Directory & Workload</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Support specialist assignments, team capacity, and verified SLA resolution track records.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl text-xs">
          <span className="text-slate-400">Total Active Specialists:</span>
          <span className="font-bold text-white text-sm">{agents.length}</span>
        </div>
      </div>

      {/* Agents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => {
          const activeLoad = tickets.filter(
            t => t.assignedAgentId === agent.id && t.status !== 'resolved' && t.status !== 'closed'
          ).length;

          const resolvedLifetime = tickets.filter(
            t => t.assignedAgentId === agent.id && (t.status === 'resolved' || t.status === 'closed')
          ).length + agent.resolvedCount;

          return (
            <div
              key={agent.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 text-slate-100 flex flex-col justify-between"
            >
              {/* Header: Avatar, Name, Role */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-indigo-600/30 flex-shrink-0">
                  {agent.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-sm text-white truncate">{agent.name}</h3>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {agent.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{agent.team}</p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{agent.email}</p>
                </div>
              </div>

              {/* Workload Stats */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Active</span>
                  <span className="text-base font-bold text-indigo-400 font-mono">{activeLoad}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Resolved</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">{resolvedLifetime}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">SLA Met</span>
                  <span className="text-base font-bold text-cyan-400 font-mono">{agent.slaAttainmentRate}%</span>
                </div>
              </div>

              {/* Assigned Permissions Tags */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Permissions & Queues
                </span>
                <div className="flex flex-wrap gap-1">
                  {agent.permissions.map(perm => (
                    <span
                      key={perm}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 font-mono"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
