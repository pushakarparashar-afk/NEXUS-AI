import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Inbox,
  Plus,
  Sparkles,
  BarChart3,
  ClockAlert,
  Users,
  UserCheck,
  Cpu,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useSensory } from '@/context/SensoryContext';
import { exportTicketsToCsv } from '@/lib/csv';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    tickets,
    customers,
    agents,
    setActiveTab,
    setSelectedTicket,
    setIsCreateTicketOpen,
    resetDemoData,
  } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { soundEnabled, setSoundEnabled } = useSensory();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredTickets = query.trim()
    ? tickets
        .filter(
          t =>
            t.id.toLowerCase().includes(query.toLowerCase()) ||
            t.subject.toLowerCase().includes(query.toLowerCase()) ||
            t.category.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const actions = [
    {
      id: 'create-ticket',
      label: 'Create New Support Ticket',
      icon: Plus,
      category: 'Actions',
      run: () => {
        setIsCreateTicketOpen(true);
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'export-csv',
      label: 'Export Tickets as CSV',
      icon: Download,
      category: 'Actions',
      run: () => {
        exportTicketsToCsv(tickets, customers, agents);
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-overview',
      label: 'Go to Overview Dashboard',
      icon: Inbox,
      category: 'Navigation',
      run: () => {
        setActiveTab('overview');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-tickets',
      label: 'Go to Ticket Management Queue',
      icon: Inbox,
      category: 'Navigation',
      run: () => {
        setActiveTab('tickets');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-copilot',
      label: 'Go to Agentforce AI Copilot',
      icon: Sparkles,
      category: 'Navigation',
      run: () => {
        setActiveTab('copilot');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-sla',
      label: 'Go to SLA Monitoring & Policies',
      icon: ClockAlert,
      category: 'Navigation',
      run: () => {
        setActiveTab('sla');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-analytics',
      label: 'Go to Operational Analytics',
      icon: BarChart3,
      category: 'Navigation',
      run: () => {
        setActiveTab('analytics');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'toggle-theme',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      icon: theme === 'dark' ? Sun : Moon,
      category: 'Preferences',
      run: () => {
        toggleTheme();
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'toggle-sound',
      label: soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects',
      icon: soundEnabled ? VolumeX : Volume2,
      category: 'Preferences',
      run: () => {
        setSoundEnabled(!soundEnabled);
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'reset-demo',
      label: 'Reset Demo Data to Initial Seed',
      icon: RotateCcw,
      category: 'Preferences',
      run: () => {
        resetDemoData();
        setIsCommandPaletteOpen(false);
      },
    },
  ];

  const filteredActions = query.trim()
    ? actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))
    : actions;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      {/* Palette Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden z-10 text-slate-100"
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/40">
          <Search className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Type a command, ticket ID, or search query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {/* Matched Tickets */}
          {filteredTickets.length > 0 && (
            <div className="pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                Matching Tickets
              </span>
              {filteredTickets.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTicket(t);
                    setIsCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-indigo-600/15 hover:text-white transition-colors group text-left"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-indigo-400 font-bold">{t.id}</span>
                    <span className="text-slate-200 truncate">{t.subject}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                </button>
              ))}
            </div>
          )}

          {/* Actions & Navigation */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
              Commands & Quick Navigation
            </span>
            {filteredActions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.run}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors group text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    <span>{action.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{action.category}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
