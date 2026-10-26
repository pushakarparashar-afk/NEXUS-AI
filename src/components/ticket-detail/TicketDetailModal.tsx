import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Building,
  Mail,
  Phone,
  Clock,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Send,
  Lock,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { Ticket, TicketStatus, TicketPriority } from '@/types';
import { useApp } from '@/context/AppContext';
import { PriorityBadge } from '@/components/tickets/PriorityBadge';
import { StatusBadge } from '@/components/tickets/StatusBadge';
import { SlaBadge } from '@/components/tickets/SlaBadge';
import { SlaCountdownWidget } from './SlaCountdownWidget';
import { ConversationThread } from './ConversationThread';
import { ReplyComposer } from './ReplyComposer';
import { ActivityTimeline } from './ActivityTimeline';
import { AICopilotPanel } from './AICopilotPanel';
import { Button } from '@/components/common/Button';
import { formatDate } from '@/lib/utils';

export const TicketDetailModal: React.FC = () => {
  const {
    selectedTicket,
    setSelectedTicket,
    customers,
    agents,
    updateTicketStatus,
    updateTicketPriority,
    assignTicket,
    addMessageToTicket,
    getMessagesForTicket,
    activities,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'conversation' | 'timeline'>('conversation');
  const [draftReplyText, setDraftReplyText] = useState<string>('');

  if (!selectedTicket) return null;

  const customer = customers.find(c => c.id === selectedTicket.customerId);
  const assignedAgent = agents.find(a => a.id === selectedTicket.assignedAgentId);
  const ticketMessages = getMessagesForTicket(selectedTicket.id);
  const ticketActivities = activities.filter(a => a.ticketId === selectedTicket.id);

  const handleStatusChange = (newStatus: TicketStatus) => {
    if (newStatus === 'resolved' || newStatus === 'closed') {
      if (confirm(`Are you sure you want to mark ticket ${selectedTicket.id} as ${newStatus.toUpperCase()}?`)) {
        updateTicketStatus(selectedTicket.id, newStatus);
      }
    } else {
      updateTicketStatus(selectedTicket.id, newStatus);
    }
  };

  const handlePriorityChange = (newPriority: TicketPriority) => {
    if (newPriority === 'critical') {
      if (confirm(`Escalating to CRITICAL priority will activate the 1h first response / 4h resolution SLA and trigger senior on-call routing. Proceed?`)) {
        updateTicketPriority(selectedTicket.id, newPriority);
      }
    } else {
      updateTicketPriority(selectedTicket.id, newPriority);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-md"
        onClick={() => setSelectedTicket(null)}
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full max-w-6xl max-h-[92vh] rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl z-10 flex flex-col text-slate-100 overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-extrabold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
              {selectedTicket.id}
            </span>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={selectedTicket.priority} />
              <StatusBadge status={selectedTicket.status} />
              <SlaBadge state={selectedTicket.slaState} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Status Dropdown */}
            <select
              value={selectedTicket.status}
              onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
            >
              <option value="new">Status: New</option>
              <option value="open">Status: Open</option>
              <option value="in_progress">Status: In Progress</option>
              <option value="waiting_customer">Status: Waiting Customer</option>
              <option value="resolved">Status: Resolved</option>
              <option value="closed">Status: Closed</option>
            </select>

            {/* Quick Priority Dropdown */}
            <select
              value={selectedTicket.priority}
              onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
            >
              <option value="low">Priority: Low</option>
              <option value="medium">Priority: Medium</option>
              <option value="high">Priority: High</option>
              <option value="critical">Priority: Critical</option>
            </select>

            <button
              onClick={() => setSelectedTicket(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split into Left Workspace (60%) and Right AI Context (40%) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* LEFT AREA: Subject, Customer Context, Conversation & Replies (7 cols) */}
          <div className="lg:col-span-7 p-6 space-y-6 overflow-y-auto">
            {/* Subject & Metadata */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {selectedTicket.subject}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Created {formatDate(selectedTicket.createdAt)}
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                  {selectedTicket.category}
                </span>
                <span>•</span>
                <span className="capitalize text-slate-400">
                  Impact: {selectedTicket.businessImpact}
                </span>
              </div>
            </div>

            {/* Customer Header Box */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Customer</span>
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  {customer?.name || selectedTicket.customerId}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-500" />
                  {customer?.company || 'Enterprise Account'}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Tier & Ingress</span>
                <div>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px] uppercase">
                    {customer?.customerTier || 'Enterprise'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Method: {selectedTicket.contactMethod.toUpperCase()}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Assigned Agent</span>
                <div className="font-semibold text-slate-200">
                  {assignedAgent?.name || 'Unassigned'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {assignedAgent?.team || 'Support Queue'}
                </div>
              </div>
            </div>

            {/* Initial Issue Description */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Original Description
              </h4>
              <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {selectedTicket.description}
              </p>
            </div>

            {/* Conversation / Activity Tabs */}
            <div className="space-y-3">
              <div className="flex items-center gap-4 border-b border-slate-800 pb-2 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('conversation')}
                  className={`pb-1 border-b-2 transition-colors ${
                    activeTab === 'conversation'
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Conversation Thread ({ticketMessages.length})
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`pb-1 border-b-2 transition-colors ${
                    activeTab === 'timeline'
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Activity Audit Timeline ({ticketActivities.length})
                </button>
              </div>

              {activeTab === 'conversation' ? (
                <div className="space-y-4">
                  <ConversationThread messages={ticketMessages} />
                  <ReplyComposer
                    draftFromAI={draftReplyText}
                    onSendMessage={(content, type) => addMessageToTicket(selectedTicket.id, content, type)}
                  />
                </div>
              ) : (
                <ActivityTimeline activities={ticketActivities} />
              )}
            </div>
          </div>

          {/* RIGHT AREA: AI Copilot & SLA Tracking Context (5 cols) */}
          <div className="lg:col-span-5 p-6 space-y-6 overflow-y-auto bg-slate-950/30">
            {/* SLA Countdown & Health Card */}
            <SlaCountdownWidget ticket={selectedTicket} />

            {/* Assignment & Routing Control */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2.5 text-xs">
              <span className="font-semibold text-slate-200 block">Agent Assignment</span>
              <select
                value={selectedTicket.assignedAgentId || ''}
                onChange={(e) => assignTicket(selectedTicket.id, e.target.value || null)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
              >
                <option value="">Unassigned Queue</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {a.team} ({a.workload} open)
                  </option>
                ))}
              </select>
            </div>

            {/* AI Copilot Panel */}
            <AICopilotPanel
              ticket={selectedTicket}
              onApplyDraft={(draft) => {
                setDraftReplyText(draft);
                setActiveTab('conversation');
              }}
              onApplyCategory={(cat) => {
                // Category applied via AI recommendation
              }}
              onApplyPriority={(p) => {
                updateTicketPriority(selectedTicket.id, p);
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
