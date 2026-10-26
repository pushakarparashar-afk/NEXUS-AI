import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Play,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  Sliders,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AutomationRule } from '@/types';
import { automationService, AutomationExecutionResult } from '@/services/automationEngine';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/common/Button';

export const AutomationBuilderView: React.FC = () => {
  const { automationRules, toggleAutomationRule, tickets } = useApp();

  const [testTicketId, setTestTicketId] = useState<string>(tickets[0]?.id || '');
  const [testResults, setTestResults] = useState<AutomationExecutionResult[] | null>(null);

  const selectedTicket = tickets.find(t => t.id === testTicketId) || tickets[0];

  const handleRunTestMode = () => {
    if (!selectedTicket) return;
    const results = automationService.testTicket(selectedTicket, 'ticket_created');
    setTestResults(results);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h1 className="text-2xl font-extrabold text-white">Automation Rule Engine</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Deterministic trigger-condition-action workflow automation matrix with real-time rule sandbox simulation.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-2xl">
          <span className="text-xs text-slate-400">Active Rules:</span>
          <span className="text-sm font-bold text-indigo-400">
            {automationRules.filter(r => r.enabled).length} / {automationRules.length}
          </span>
        </div>
      </div>

      {/* Rules Visual Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Configured Workflow Rules
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {automationRules.map(rule => (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl border transition-all ${
                rule.enabled
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-slate-950/60 border-slate-800/40 opacity-70'
              }`}
            >
              {/* Top Row: Name, Description & Toggle */}
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">{rule.id}</span>
                    <h4 className="text-sm font-bold text-white">{rule.name}</h4>
                    {rule.enabled ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-400">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{rule.description}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right text-[11px] text-slate-400 hidden sm:block">
                    <div>Fired: <span className="font-mono font-bold text-white">{rule.executionCount}</span> times</div>
                    {rule.lastExecutedAt && (
                      <div className="text-[10px] text-slate-500">Last: {formatDate(rule.lastExecutedAt)}</div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleAutomationRule(rule.id)}
                    className="text-slate-400 hover:text-white transition-colors"
                    title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                  >
                    {rule.enabled ? (
                      <ToggleRight className="w-8 h-8 text-indigo-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Visual Trigger -> Condition -> Action flow */}
              <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Trigger */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-400">1. Trigger</span>
                  <div className="font-semibold text-slate-200 capitalize">
                    {rule.trigger.replace('_', ' ')}
                  </div>
                  <p className="text-[11px] text-slate-500">Evaluates on ticket lifecycle event</p>
                </div>

                {/* Condition */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400">2. Conditions</span>
                  <div className="space-y-1">
                    {rule.conditions.map((cond, idx) => (
                      <div key={idx} className="font-mono text-[11px] text-slate-300">
                        {cond.field} <span className="text-amber-400 font-bold">{cond.operator}</span> "{cond.value}"
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">3. Actions</span>
                  <div className="space-y-1">
                    {rule.actions.map((act, idx) => (
                      <div key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5 truncate">
                        <ArrowRight className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="capitalize">{act.type.replace('_', ' ')}:</span>
                        <span className="font-mono text-slate-400 truncate">
                          {JSON.stringify(act.payload)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Rule Test Sandbox */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Rule Execution Sandbox Simulator</h3>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={testTicketId}
              onChange={(e) => setTestTicketId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
            >
              {tickets.map(t => (
                <option key={t.id} value={t.id}>
                  Test on {t.id} ({t.priority.toUpperCase()} - {t.category})
                </option>
              ))}
            </select>
            <Button variant="primary" size="sm" onClick={handleRunTestMode}>
              <Play className="w-3.5 h-3.5" />
              <span>Simulate Rules</span>
            </Button>
          </div>
        </div>

        {/* Test Output Results */}
        {testResults ? (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Simulation Results for {selectedTicket.id}:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {testResults.map(res => (
                <div
                  key={res.ruleId}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    res.matched
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{res.ruleName}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        res.matched ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {res.matched ? 'MATCHED & FIRED' : 'DID NOT MATCH'}
                    </span>
                  </div>
                  {res.matched && (
                    <div className="pt-1 text-[11px] text-emerald-300 space-y-1">
                      <span className="font-semibold block">Actions that would trigger:</span>
                      {res.executedActions.map((a, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
            Select a sample ticket above and click "Simulate Rules" to inspect which conditions and automated actions will trigger.
          </div>
        )}
      </div>
    </div>
  );
};
