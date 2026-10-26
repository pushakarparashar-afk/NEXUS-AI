import {
  Customer,
  SupportAgent,
  Ticket,
  TicketMessage,
  ActivityEvent,
  AIFeedbackRecord,
  InAppNotification,
  SlaPolicy,
  AutomationRule,
} from '@/types';
import {
  SEED_CUSTOMERS,
  SEED_AGENTS,
  SEED_TICKETS,
  SEED_MESSAGES,
  SEED_ACTIVITIES,
  SEED_AI_FEEDBACK,
  SEED_NOTIFICATIONS,
} from './seedData';
import { DEFAULT_SLA_POLICIES } from './slaEngine';
import { DEFAULT_AUTOMATION_RULES } from './automationEngine';

const STORAGE_VERSION = 'nexus_v1_0_0';
const KEYS = {
  VERSION: 'nexus_schema_version',
  TICKETS: 'nexus_tickets',
  CUSTOMERS: 'nexus_customers',
  AGENTS: 'nexus_agents',
  MESSAGES: 'nexus_messages',
  ACTIVITIES: 'nexus_activities',
  AI_FEEDBACK: 'nexus_ai_feedback',
  NOTIFICATIONS: 'nexus_notifications',
  SLA_POLICIES: 'nexus_sla_policies',
  AUTOMATION_RULES: 'nexus_automation_rules',
};

class StorageRepository {
  constructor() {
    this.ensureInitialized();
  }

  public ensureInitialized(forceReset = false) {
    if (typeof window === 'undefined') return;

    try {
      const currentVer = localStorage.getItem(KEYS.VERSION);
      if (forceReset || currentVer !== STORAGE_VERSION) {
        localStorage.setItem(KEYS.VERSION, STORAGE_VERSION);
        localStorage.setItem(KEYS.TICKETS, JSON.stringify(SEED_TICKETS));
        localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(SEED_CUSTOMERS));
        localStorage.setItem(KEYS.AGENTS, JSON.stringify(SEED_AGENTS));
        localStorage.setItem(KEYS.MESSAGES, JSON.stringify(SEED_MESSAGES));
        localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(SEED_ACTIVITIES));
        localStorage.setItem(KEYS.AI_FEEDBACK, JSON.stringify(SEED_AI_FEEDBACK));
        localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
        localStorage.setItem(KEYS.SLA_POLICIES, JSON.stringify(DEFAULT_SLA_POLICIES));
        localStorage.setItem(KEYS.AUTOMATION_RULES, JSON.stringify(DEFAULT_AUTOMATION_RULES));
      }
    } catch {
      // Storage unavailable fallback
    }
  }

  // --- Tickets ---
  public getTickets(): Ticket[] {
    try {
      const data = localStorage.getItem(KEYS.TICKETS);
      return data ? JSON.parse(data) : SEED_TICKETS;
    } catch {
      return SEED_TICKETS;
    }
  }

  public saveTicket(ticket: Ticket): void {
    const tickets = this.getTickets();
    const idx = tickets.findIndex(t => t.id === ticket.id);
    if (idx >= 0) {
      tickets[idx] = ticket;
    } else {
      tickets.unshift(ticket);
    }
    localStorage.setItem(KEYS.TICKETS, JSON.stringify(tickets));
  }

  public deleteTicket(ticketId: string): void {
    const tickets = this.getTickets().filter(t => t.id !== ticketId);
    localStorage.setItem(KEYS.TICKETS, JSON.stringify(tickets));
  }

  // --- Customers ---
  public getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : SEED_CUSTOMERS;
    } catch {
      return SEED_CUSTOMERS;
    }
  }

  // --- Agents ---
  public getAgents(): SupportAgent[] {
    try {
      const data = localStorage.getItem(KEYS.AGENTS);
      return data ? JSON.parse(data) : SEED_AGENTS;
    } catch {
      return SEED_AGENTS;
    }
  }

  // --- Messages ---
  public getMessages(ticketId?: string): TicketMessage[] {
    try {
      const data = localStorage.getItem(KEYS.MESSAGES);
      const all: TicketMessage[] = data ? JSON.parse(data) : SEED_MESSAGES;
      return ticketId ? all.filter(m => m.ticketId === ticketId) : all;
    } catch {
      return SEED_MESSAGES;
    }
  }

  public addMessage(msg: TicketMessage): void {
    const msgs = this.getMessages();
    msgs.push(msg);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(msgs));
  }

  // --- Activities ---
  public getActivities(ticketId?: string): ActivityEvent[] {
    try {
      const data = localStorage.getItem(KEYS.ACTIVITIES);
      const all: ActivityEvent[] = data ? JSON.parse(data) : SEED_ACTIVITIES;
      return ticketId ? all.filter(a => a.ticketId === ticketId) : all;
    } catch {
      return SEED_ACTIVITIES;
    }
  }

  public addActivity(act: ActivityEvent): void {
    const acts = this.getActivities();
    acts.unshift(act);
    localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(acts));
  }

  // --- AI Feedback ---
  public getAIFeedback(): AIFeedbackRecord[] {
    try {
      const data = localStorage.getItem(KEYS.AI_FEEDBACK);
      return data ? JSON.parse(data) : SEED_AI_FEEDBACK;
    } catch {
      return SEED_AI_FEEDBACK;
    }
  }

  public addAIFeedback(fb: AIFeedbackRecord): void {
    const list = this.getAIFeedback();
    list.unshift(fb);
    localStorage.setItem(KEYS.AI_FEEDBACK, JSON.stringify(list));
  }

  // --- Notifications ---
  public getNotifications(): InAppNotification[] {
    try {
      const data = localStorage.getItem(KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : SEED_NOTIFICATIONS;
    } catch {
      return SEED_NOTIFICATIONS;
    }
  }

  public addNotification(notif: InAppNotification): void {
    const list = this.getNotifications();
    list.unshift(notif);
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
  }

  public markNotificationRead(id: string): void {
    const list = this.getNotifications();
    const item = list.find(n => n.id === id);
    if (item) {
      item.read = true;
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
    }
  }

  public markAllNotificationsRead(): void {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
  }

  // --- SLA Policies ---
  public getSlaPolicies(): SlaPolicy[] {
    try {
      const data = localStorage.getItem(KEYS.SLA_POLICIES);
      return data ? JSON.parse(data) : DEFAULT_SLA_POLICIES;
    } catch {
      return DEFAULT_SLA_POLICIES;
    }
  }

  public saveSlaPolicies(policies: SlaPolicy[]): void {
    localStorage.setItem(KEYS.SLA_POLICIES, JSON.stringify(policies));
  }

  // --- Automation Rules ---
  public getAutomationRules(): AutomationRule[] {
    try {
      const data = localStorage.getItem(KEYS.AUTOMATION_RULES);
      return data ? JSON.parse(data) : DEFAULT_AUTOMATION_RULES;
    } catch {
      return DEFAULT_AUTOMATION_RULES;
    }
  }

  public saveAutomationRules(rules: AutomationRule[]): void {
    localStorage.setItem(KEYS.AUTOMATION_RULES, JSON.stringify(rules));
  }

  public resetDemoData(): void {
    this.ensureInitialized(true);
  }
}

export const storage = new StorageRepository();
