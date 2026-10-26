import React, { useState } from 'react';
import {
  Search,
  Command,
  Bell,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Plus,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useSensory } from '@/context/SensoryContext';
import { Button } from '@/components/common/Button';
import { NotificationCenter } from './NotificationCenter';
import { SensorySettingsModal } from './SensorySettingsModal';
import { UserRole } from '@/types';

export const TopNav: React.FC = () => {
  const {
    activeTab,
    notifications,
    setIsCreateTicketOpen,
    setIsCommandPaletteOpen,
    currentRole,
    setCurrentRole,
    resetDemoData,
  } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { soundEnabled, setSoundEnabled } = useSensory();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSensoryModalOpen, setIsSensoryModalOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'overview': return 'Command Center Overview';
      case 'tickets': return 'Ticket Management & Queue';
      case 'copilot': return 'Agentforce AI Copilot';
      case 'sla': return 'SLA Monitoring & Compliance';
      case 'customers': return 'Customer Directory';
      case 'agents': return 'Support Agents & Workload';
      case 'analytics': return 'Operational Analytics & Reports';
      case 'automation': return 'Automation Rule Engine';
      case 'salesforce': return 'Salesforce Enterprise Gateway';
      case 'settings': return 'System Settings & Audit';
      default: return 'Overview';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0a0f1d]/90 backdrop-blur-md sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Left Breadcrumb & Title */}
      <div className="flex items-center gap-3 pl-10 md:pl-0">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-indigo-400">NEXUS</span>
          <span>/</span>
          <span className="text-slate-200 font-medium">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Center Search / Command Palette Trigger */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all text-xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-500" />
            <span>Search tickets, customers, rules...</span>
          </div>
          <kbd className="flex items-center gap-1 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 font-mono text-slate-400">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Demo Mode Role Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
          <span className="text-[10px] text-slate-400 px-2 font-medium hidden sm:inline">Role:</span>
          {(['admin', 'manager', 'agent'] as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => setCurrentRole(role)}
              className={`px-2 py-1 rounded capitalize font-medium transition-colors ${
                currentRole === role
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`Switch to ${role} role (Demo Switch)`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Sensory Sound Toggle & Settings */}
        <button
          onClick={() => setIsSensoryModalOpen(true)}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors relative"
          title="Audio & Haptic Feedback Settings"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Center */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors relative"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            )}
          </button>
          {isNotifOpen && <NotificationCenter onClose={() => setIsNotifOpen(false)} />}
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (confirm('Reset all demo data back to initial seed state?')) {
              resetDemoData();
            }
          }}
          className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors hidden sm:flex"
          title="Reset Demo Data to Initial Seed"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Primary Create Ticket Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateTicketOpen(true)}
          className="font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Ticket</span>
        </Button>
      </div>

      {/* Sensory Settings Modal */}
      <SensorySettingsModal
        isOpen={isSensoryModalOpen}
        onClose={() => setIsSensoryModalOpen(false)}
      />
    </header>
  );
};
