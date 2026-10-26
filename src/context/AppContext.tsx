import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Ticket,
  Customer,
  SupportAgent,
  UserRole,
  InAppNotification,
  SlaPolicy,
  AutomationRule,
  ActivityEvent,
  AIFeedbackRecord,
  TimeRangeFilter,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketMessage,
} from '@/types';
import { storage } from '@/services/storage';
import { slaService } from '@/services/slaEngine';
import { automationService } from '@/services/automationEngine';
import { generateTicketId } from '@/lib/utils';
import { useSensory } from './SensoryContext';

export interface CreateTicketDTO {
  subject: string;
  description: string;
  customerId: string;
  category: TicketCategory;
  priority: TicketPriority;
  contactMethod?: 'email' | 'phone' | 'portal' | 'api';
  businessImpact?: 'low' | 'medium' | 'high' | 'critical';
  urgency?: 'low' | 'medium' | 'high';
  assignedAgentId?: string | null;
  tags?: string[];
}

interface AppContextType {
  tickets: Ticket[];
  customers: Customer[];
  agents: SupportAgent[];
  currentUser: SupportAgent;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  notifications: InAppNotification[];
  slaPolicies: SlaPolicy[];
  automationRules: AutomationRule[];
  activities: ActivityEvent[];
  aiFeedback: AIFeedbackRecord[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedTicket: Ticket | null;
  setSelectedTicket: (t: Ticket | null) => void;
  isCreateTicketOpen: boolean;
  setIsCreateTicketOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  timeRange: TimeRangeFilter;
  setTimeRange: (tr: TimeRangeFilter) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Actions
  createTicket: (dto: CreateTicketDTO) => Ticket;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  updateTicketPriority: (ticketId: string, priority: TicketPriority) => void;
  assignTicket: (ticketId: string, agentId: string | null) => void;
  bulkAssign: (ticketIds: string[], agentId: string) => void;
  bulkUpdateStatus: (ticketIds: string[], status: TicketStatus) => void;
  addMessageToTicket: (ticketId: string, content: string, type: 'reply' | 'internal_note') => void;
  getMessagesForTicket: (ticketId: string) => TicketMessage[];
  recordAIFeedback: (fb: {
    ticketId: string;
    recommendationType: AIFeedbackRecord['recommendationType'];
    recommendationContent: string;
    decision: 'accepted' | 'edited' | 'rejected';
    rejectionReason?: string;
    editedContent?: string;
  }) => void;
  toggleAutomationRule: (ruleId: string) => void;
  updateSlaPolicy: (policy: SlaPolicy) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { playSound, triggerHaptic } = useSensory();

  const [tickets, setTickets] = useState<Ticket[]>(() => storage.getTickets());
  const [customers] = useState<Customer[]>(() => storage.getCustomers());
  const [agents, setAgents] = useState<SupportAgent[]>(() => storage.getAgents());
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => storage.getNotifications());
  const [slaPolicies, setSlaPolicies] = useState<SlaPolicy[]>(() => storage.getSlaPolicies());
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(() => storage.getAutomationRules());
  const [activities, setActivities] = useState<ActivityEvent[]>(() => storage.getActivities());
  const [aiFeedback, setAiFeedback] = useState<AIFeedbackRecord[]>(() => storage.getAIFeedback());

  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('7d');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentUser = agents.find(a => a.role === currentRole) || agents[0];

  // SLA periodic evaluation ticker (runs every 30 seconds to refresh remaining timers and states)
  useEffect(() => {
    const interval = setInterval(() => {
      setTickets(prevTickets => {
        let hasChanges = false;
        const evaluated = prevTickets.map(t => {
          const newState = slaService.evaluateTicketSlaState(t);
          if (newState !== t.slaState) {
            hasChanges = true;
            return { ...t, slaState: newState };
          }
          return t;
        });

        if (hasChanges) {
          evaluated.forEach(t => storage.saveTicket(t));
          return evaluated;
        }
        return prevTickets;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Update selectedTicket if it exists in state
  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedTicket)) {
        setSelectedTicket(updated);
      }
    }
  }, [tickets, selectedTicket]);

  const createTicket = (dto: CreateTicketDTO): Ticket => {
    const nowIso = new Date().toISOString();
    const newId = generateTicketId(tickets);

    // Calculate initial SLA deadlines using priority
    const deadlines = slaService.calculateDeadlines(nowIso, dto.priority);

    let newTicket: Ticket = {
      id: newId,
      subject: dto.subject,
      description: dto.description,
      customerId: dto.customerId,
      assignedAgentId: dto.assignedAgentId || null,
      category: dto.category,
      priority: dto.priority,
      status: 'new',
      createdAt: nowIso,
      updatedAt: nowIso,
      firstResponseAt: null,
      resolvedAt: null,
      firstResponseDeadline: deadlines.firstResponseDeadline,
      resolutionDeadline: deadlines.resolutionDeadline,
      slaState: 'on_track',
      tags: dto.tags || [],
      contactMethod: dto.contactMethod || 'portal',
      businessImpact: dto.businessImpact || 'medium',
      urgency: dto.urgency || 'medium',
    };

    // Run automation engine triggers
    const autoResult = automationService.execute(newTicket, 'ticket_created');
    newTicket = autoResult.updatedTicket;

    // Create activity event
    const creationActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      ticketId: newTicket.id,
      actor: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'created',
      description: `Ticket created (${newTicket.category}, ${newTicket.priority.toUpperCase()} priority).`,
      timestamp: nowIso,
    };

    // Create in-app notification
    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Ticket Created',
      message: `${newTicket.id}: ${newTicket.subject}`,
      type: newTicket.priority === 'critical' ? 'critical' : 'info',
      ticketId: newTicket.id,
      read: false,
      timestamp: nowIso,
    };

    // Persist
    storage.saveTicket(newTicket);
    storage.addActivity(creationActivity);
    autoResult.newActivities.forEach(a => storage.addActivity(a));
    storage.addNotification(newNotif);
    autoResult.newNotifications.forEach(n => storage.addNotification(n));

    // Update state
    setTickets(prev => [newTicket, ...prev]);
    setActivities(prev => [creationActivity, ...autoResult.newActivities, ...prev]);
    setNotifications(prev => [newNotif, ...autoResult.newNotifications, ...prev]);

    playSound('create');
    triggerHaptic('confirm');

    return newTicket;
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus) => {
    const nowIso = new Date().toISOString();
    const existing = tickets.find(t => t.id === ticketId);
    if (!existing) return;

    const resolvedAt = status === 'resolved' || status === 'closed' ? existing.resolvedAt || nowIso : null;

    let updated: Ticket = {
      ...existing,
      status,
      updatedAt: nowIso,
      resolvedAt,
    };

    // Re-evaluate SLA state
    updated.slaState = slaService.evaluateTicketSlaState(updated);

    const act: ActivityEvent = {
      id: `act-${Date.now()}`,
      ticketId: updated.id,
      actor: currentUser.name,
      actorRole: currentUser.role,
      eventType: status === 'resolved' ? 'resolved' : 'status_changed',
      description: `Status changed from ${existing.status} to ${status}.`,
      timestamp: nowIso,
    };

    storage.saveTicket(updated);
    storage.addActivity(act);

    setTickets(prev => prev.map(t => (t.id === ticketId ? updated : t)));
    setActivities(prev => [act, ...prev]);

    if (status === 'resolved') {
      playSound('resolve');
      triggerHaptic('save');
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#6366f1', '#10b981', '#06b6d4'],
        });
      } catch {}
    } else {
      playSound('save');
      triggerHaptic('save');
    }
  };

  const updateTicketPriority = (ticketId: string, priority: TicketPriority) => {
    const nowIso = new Date().toISOString();
    const existing = tickets.find(t => t.id === ticketId);
    if (!existing) return;

    // Recalculate deadline based on new priority
    const deadlines = slaService.calculateDeadlines(existing.createdAt, priority);

    const updated: Ticket = {
      ...existing,
      priority,
      updatedAt: nowIso,
      firstResponseDeadline: deadlines.firstResponseDeadline,
      resolutionDeadline: deadlines.resolutionDeadline,
    };
    updated.slaState = slaService.evaluateTicketSlaState(updated);

    const act: ActivityEvent = {
      id: `act-${Date.now()}`,
      ticketId: updated.id,
      actor: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'priority_changed',
      description: `Priority updated from ${existing.priority.toUpperCase()} to ${priority.toUpperCase()}.`,
      timestamp: nowIso,
    };

    storage.saveTicket(updated);
    storage.addActivity(act);

    setTickets(prev => prev.map(t => (t.id === ticketId ? updated : t)));
    setActivities(prev => [act, ...prev]);
    playSound('save');
    triggerHaptic('save');
  };

  const assignTicket = (ticketId: string, agentId: string | null) => {
    const nowIso = new Date().toISOString();
    const existing = tickets.find(t => t.id === ticketId);
    if (!existing) return;

    const agentObj = agents.find(a => a.id === agentId);
    const assignedName = agentObj ? agentObj.name : 'Unassigned';

    const updated: Ticket = {
      ...existing,
      assignedAgentId: agentId,
      updatedAt: nowIso,
    };

    const act: ActivityEvent = {
      id: `act-${Date.now()}`,
      ticketId: updated.id,
      actor: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'assigned',
      description: `Ticket assigned to ${assignedName}.`,
      timestamp: nowIso,
    };

    storage.saveTicket(updated);
    storage.addActivity(act);

    setTickets(prev => prev.map(t => (t.id === ticketId ? updated : t)));
    setActivities(prev => [act, ...prev]);
    playSound('save');
    triggerHaptic('save');
  };

  const bulkAssign = (ticketIds: string[], agentId: string) => {
    ticketIds.forEach(id => assignTicket(id, agentId));
  };

  const bulkUpdateStatus = (ticketIds: string[], status: TicketStatus) => {
    ticketIds.forEach(id => updateTicketStatus(id, status));
  };

  const addMessageToTicket = (ticketId: string, content: string, type: 'reply' | 'internal_note') => {
    const nowIso = new Date().toISOString();
    const msg: TicketMessage = {
      id: `msg-${Date.now()}`,
      ticketId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorType: 'agent',
      content,
      messageType: type,
      timestamp: nowIso,
    };

    storage.addMessage(msg);

    // If reply sent by agent and firstResponseAt is null, mark first response!
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket && type === 'reply' && !ticket.firstResponseAt) {
      const updated: Ticket = {
        ...ticket,
        firstResponseAt: nowIso,
        status: ticket.status === 'new' ? 'open' : ticket.status,
        updatedAt: nowIso,
      };
      updated.slaState = slaService.evaluateTicketSlaState(updated);
      storage.saveTicket(updated);
      setTickets(prev => prev.map(t => (t.id === ticketId ? updated : t)));
    }

    const act: ActivityEvent = {
      id: `act-${Date.now()}`,
      ticketId,
      actor: currentUser.name,
      actorRole: currentUser.role,
      eventType: type === 'reply' ? 'reply_sent' : 'note_added',
      description: type === 'reply' ? 'Sent customer reply.' : 'Added internal note.',
      timestamp: nowIso,
    };
    storage.addActivity(act);
    setActivities(prev => [act, ...prev]);

    playSound('save');
    triggerHaptic('save');
  };

  const getMessagesForTicket = (ticketId: string): TicketMessage[] => {
    return storage.getMessages(ticketId);
  };

  const recordAIFeedback = (fb: {
    ticketId: string;
    recommendationType: AIFeedbackRecord['recommendationType'];
    recommendationContent: string;
    decision: 'accepted' | 'edited' | 'rejected';
    rejectionReason?: string;
    editedContent?: string;
  }) => {
    const nowIso = new Date().toISOString();
    const record: AIFeedbackRecord = {
      id: `fb-${Date.now()}`,
      ticketId: fb.ticketId,
      recommendationType: fb.recommendationType,
      recommendationContent: fb.recommendationContent,
      decision: fb.decision,
      rejectionReason: fb.rejectionReason,
      editedContent: fb.editedContent,
      agentId: currentUser.id,
      timestamp: nowIso,
    };

    storage.addAIFeedback(record);
    setAiFeedback(prev => [record, ...prev]);

    const act: ActivityEvent = {
      id: `act-${Date.now()}`,
      ticketId: fb.ticketId,
      actor: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'ai_applied',
      description: `AI recommendation (${fb.recommendationType}) marked as ${fb.decision.toUpperCase()}.${fb.rejectionReason ? ` Reason: ${fb.rejectionReason}` : ''}`,
      timestamp: nowIso,
    };
    storage.addActivity(act);
    setActivities(prev => [act, ...prev]);

    playSound('save');
    triggerHaptic('confirm');
  };

  const toggleAutomationRule = (ruleId: string) => {
    const active = automationService.toggleRule(ruleId);
    setAutomationRules([...automationService.getRules()]);
    storage.saveAutomationRules(automationService.getRules());
    playSound('save');
  };

  const updateSlaPolicy = (policy: SlaPolicy) => {
    slaService.updatePolicy(policy);
    const updated = slaPolicies.map(p => (p.id === policy.id ? policy : p));
    setSlaPolicies(updated);
    storage.saveSlaPolicies(updated);
    playSound('save');
  };

  const markNotificationRead = (id: string) => {
    storage.markNotificationRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    storage.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetDemoData = () => {
    storage.resetDemoData();
    setTickets(storage.getTickets());
    setAgents(storage.getAgents());
    setNotifications(storage.getNotifications());
    setSlaPolicies(storage.getSlaPolicies());
    setAutomationRules(storage.getAutomationRules());
    setActivities(storage.getActivities());
    setAiFeedback(storage.getAIFeedback());
    playSound('resolve');
  };

  return (
    <AppContext.Provider
      value={{
        tickets,
        customers,
        agents,
        currentUser,
        currentRole,
        setCurrentRole,
        notifications,
        slaPolicies,
        automationRules,
        activities,
        aiFeedback,
        activeTab,
        setActiveTab,
        selectedTicket,
        setSelectedTicket,
        isCreateTicketOpen,
        setIsCreateTicketOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        timeRange,
        setTimeRange,
        searchQuery,
        setSearchQuery,
        createTicket,
        updateTicketStatus,
        updateTicketPriority,
        assignTicket,
        bulkAssign,
        bulkUpdateStatus,
        addMessageToTicket,
        getMessagesForTicket,
        recordAIFeedback,
        toggleAutomationRule,
        updateSlaPolicy,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
