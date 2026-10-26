import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { OverviewDashboard } from '@/components/dashboard/OverviewDashboard';
import { TicketsView } from '@/components/tickets/TicketsView';
import { CopilotView } from '@/components/copilot/CopilotView';
import { SlaDashboardView } from '@/components/sla/SlaDashboardView';
import { AutomationBuilderView } from '@/components/automation/AutomationBuilderView';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { CustomerDirectoryView } from '@/components/customers/CustomerDirectoryView';
import { AgentDirectoryView } from '@/components/agents/AgentDirectoryView';
import { SalesforceIntegrationView } from '@/components/salesforce/SalesforceIntegrationView';
import { SettingsView } from '@/components/settings/SettingsView';
import { CreateTicketModal } from '@/components/tickets/CreateTicketModal';
import { TicketDetailModal } from '@/components/ticket-detail/TicketDetailModal';

export const App: React.FC = () => {
  const { activeTab, isCreateTicketOpen, setIsCreateTicketOpen } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard />;
      case 'tickets':
        return <TicketsView />;
      case 'copilot':
        return <CopilotView />;
      case 'sla':
        return <SlaDashboardView />;
      case 'customers':
        return <CustomerDirectoryView />;
      case 'agents':
        return <AgentDirectoryView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'automation':
        return <AutomationBuilderView />;
      case 'salesforce':
        return <SalesforceIntegrationView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0f1d] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Persistent Responsive Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navigation */}
        <TopNav />

        {/* View Content Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Interactive Modals */}
      <CommandPalette />
      <CreateTicketModal
        isOpen={isCreateTicketOpen}
        onClose={() => setIsCreateTicketOpen(false)}
      />
      <TicketDetailModal />
    </div>
  );
};
