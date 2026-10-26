import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Inbox,
  Sparkles,
  ClockAlert,
  Users,
  UserCheck,
  BarChart3,
  Cpu,
  CloudLightning,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Menu,
  X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, tickets, currentRole } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Compute live badges for sidebar items
  const openCount = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;
  const criticalCount = tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed').length;
  const atRiskCount = tickets.filter(t => t.slaState === 'at_risk' || t.slaState === 'breached').length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'tickets', label: 'Tickets', icon: Inbox, badge: openCount, badgeColor: 'bg-indigo-500/20 text-indigo-300' },
    { id: 'copilot', label: 'AI Copilot', icon: Sparkles, highlight: true },
    { id: 'sla', label: 'SLA Monitoring', icon: ClockAlert, badge: atRiskCount > 0 ? atRiskCount : undefined, badgeColor: 'bg-rose-500/20 text-rose-300' },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'agents', label: 'Support Agents', icon: UserCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'automation', label: 'Automation Rules', icon: Cpu },
    { id: 'salesforce', label: 'Salesforce Bridge', icon: CloudLightning },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#0a0f1d] border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setActiveTab('overview')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-600/30 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col truncate"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base tracking-tight">NEXUS</span>
                <span className="text-xs px-1.5 py-0.2 rounded font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">AI</span>
              </div>
              <span className="text-[10px] text-slate-400 truncate">Intelligent Support Ops</span>
            </motion.div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-indigo-600/15 text-white font-semibold border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
              title={collapsed ? item.label : undefined}
            >
              {/* Active Left Indicator Bar */}
              {isActive && (
                <motion.div
                  layoutId="activeNavPill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full"
                />
              )}

              <Icon
                className={cn(
                  'w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105',
                  isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200',
                  item.highlight && !isActive && 'text-cyan-400'
                )}
              />

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between truncate text-left">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold', item.badgeColor)}>
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Live
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Operational Incident Status Pill */}
      {!collapsed && (
        <div className="p-3 m-2 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', criticalCount > 0 ? 'bg-rose-400' : 'bg-emerald-400')} />
              <span className={cn('relative inline-flex rounded-full h-2 w-2', criticalCount > 0 ? 'bg-rose-500' : 'bg-emerald-500')} />
            </span>
            <span className="text-xs font-semibold text-slate-300">
              {criticalCount > 0 ? `${criticalCount} Active P1 Outages` : 'System Operational'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            SLA Targets: 97.4% Met
          </div>
        </div>
      )}

      {/* Role Indicator Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {currentRole.slice(0, 2).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 truncate">
              <div className="text-xs font-semibold text-white capitalize">{currentRole} Mode</div>
              <div className="text-[10px] text-slate-400">Demo Role Active</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Hamburger (visible on mobile only) */}
      <div className="md:hidden fixed top-3 left-3 z-40">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 shadow-lg backdrop-blur-md"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-72 h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {navContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          'hidden md:block h-screen sticky top-0 transition-all duration-300 z-30 flex-shrink-0',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {navContent}
      </aside>
    </>
  );
};
