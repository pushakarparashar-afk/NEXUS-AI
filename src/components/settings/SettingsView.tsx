import React from 'react';
import {
  Settings,
  Shield,
  Volume2,
  Moon,
  Sun,
  Smartphone,
  RotateCcw,
  Database,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useSensory } from '@/context/SensoryContext';
import { Button } from '@/components/common/Button';

export const SettingsView: React.FC = () => {
  const { currentUser, currentRole, setCurrentRole, resetDemoData, tickets } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { soundEnabled, setSoundEnabled, hapticsEnabled, setHapticsEnabled, hapticsSupported, soundVolume, setSoundVolume } = useSensory();

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h1 className="text-2xl font-extrabold text-white">System Settings & Governance</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Profile controls, simulated demo sandbox management, and sensory interface configuration.
          </p>
        </div>
      </div>

      {/* Demo Mode Notice Box */}
      <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-200 space-y-2">
        <div className="flex items-center gap-2 font-bold text-white">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>Interactive Demo Sandbox Mode Active</span>
        </div>
        <p className="leading-relaxed text-indigo-300">
          NEXUS AI is currently running in local persistent demo mode. All tickets, SLAs, rule executions, and AI classifications are processed and preserved in browser storage without exposing private cloud credentials.
        </p>
      </div>

      {/* Role Switcher Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Role-Based Access Control (RBAC) Switcher</h3>
          <p className="text-xs text-slate-400">Test platform permissions across enterprise tiers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { role: 'admin', label: 'Administrator', desc: 'Full policy, rule editing, priority escalation, and audit access' },
            { role: 'manager', label: 'Support Manager', desc: 'Team reassignment, analytics export, and SLA queue monitoring' },
            { role: 'agent', label: 'Support Agent', desc: 'Ticket resolution, customer replies, internal notes, and AI Copilot' },
          ].map((item) => (
            <div
              key={item.role}
              onClick={() => setCurrentRole(item.role as any)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                currentRole === item.role
                  ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">{item.label}</span>
                {currentRole === item.role && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sensory Audio & Theme Preferences */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Interface & Sensory Preferences</h3>
          <p className="text-xs text-slate-400">Audio chimes, haptics, and display theme</p>
        </div>

        <div className="space-y-4 text-xs divide-y divide-slate-800">
          {/* Audio */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="font-semibold text-white block">Synthesized Audio Cues</span>
                <span className="text-slate-400 text-[11px]">Play subtle harmonic tones for actions & warnings</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <div>
                <span className="font-semibold text-white block">Theme Mode</span>
                <span className="text-slate-400 text-[11px]">Currently active: {theme.toUpperCase()}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone / Reset Demo Data */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-rose-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Reset Demo Environment</h3>
            <p className="text-xs text-slate-400">
              Restore the original 26 seeded demo tickets, metrics, and automation configurations.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm('Reset all tickets and state to initial seed dataset?')) {
                resetDemoData();
              }
            }}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset State
          </Button>
        </div>
      </div>
    </div>
  );
};
