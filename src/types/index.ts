export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export type TicketStatus = 'new' | 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';

export type TicketCategory = 
  | 'Billing & Payments'
  | 'Technical Support'
  | 'Account Access'
  | 'Product Issue'
  | 'Delivery & Orders'
  | 'Security'
  | 'Other';

export type SlaState = 'on_track' | 'at_risk' | 'breached' | 'met' | 'paused';

export type UserRole = 'admin' | 'manager' | 'agent';

export type CustomerTier = 'Standard' | 'Pro' | 'Enterprise' | 'VIP';

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  customerTier: CustomerTier;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team: string;
  active: boolean;
  avatarUrl?: string;
  workload: number; // number of open tickets
  resolvedCount: number;
  slaAttainmentRate: number; // percentage e.g. 96.5
  permissions: string[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorType: 'agent' | 'customer' | 'system' | 'ai';
  content: string;
  messageType: 'reply' | 'internal_note' | 'system_event';
  timestamp: string;
}

export interface ActivityEvent {
  id: string;
  ticketId: string;
  actor: string;
  actorRole: string;
  eventType: 
    | 'created' 
    | 'status_changed' 
    | 'priority_changed' 
    | 'assigned' 
    | 'reassigned'
    | 'sla_breached' 
    | 'ai_applied' 
    | 'note_added' 
    | 'reply_sent' 
    | 'resolved'
    | 'reopened'
    | 'rule_executed';
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface AIFeedbackRecord {
  id: string;
  ticketId: string;
  recommendationType: 'classification' | 'priority' | 'summary' | 'draft_reply' | 'next_action' | 'troubleshooting';
  recommendationContent: string;
  decision: 'accepted' | 'edited' | 'rejected';
  rejectionReason?: string;
  editedContent?: string;
  agentId: string;
  timestamp: string;
}

export interface AIAnalysisResult {
  category: TicketCategory;
  suggestedPriority: TicketPriority;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'frustrated' | 'urgent';
  confidence: number; // 0.0 to 1.0
  rationale: string;
  recommendedActions: string[];
  suggestedTroubleshooting: string[];
  draftReply: string;
  safetyWarnings?: string[];
  similarTicketIds?: string[];
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  customerId: string;
  assignedAgentId: string | null;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  firstResponseDeadline: string;
  resolutionDeadline: string;
  slaState: SlaState;
  tags: string[];
  contactMethod: 'email' | 'phone' | 'portal' | 'api';
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  urgency: 'low' | 'medium' | 'high';
  aiSummary?: string;
  aiClassification?: {
    category: TicketCategory;
    confidence: number;
    suggestedPriority: TicketPriority;
    sentiment: 'positive' | 'neutral' | 'frustrated' | 'urgent';
    rationale: string;
  };
}

export interface SlaPolicy {
  id: string;
  priority: TicketPriority;
  firstResponseMinutes: number; // in minutes
  resolutionMinutes: number;   // in minutes
  businessHoursOnly: boolean;
  atRiskThresholdPercent: number; // default e.g. 75%
  description: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: 'ticket_created' | 'status_changed' | 'priority_changed' | 'sla_warning';
  conditions: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'in' | 'greater_than';
    value: any;
  }>;
  actions: Array<{
    type: 'assign_agent' | 'assign_queue' | 'set_priority' | 'set_status' | 'add_internal_note' | 'send_notification' | 'apply_tag';
    payload: any;
  }>;
  executionCount: number;
  lastExecutedAt?: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success' | 'ai';
  ticketId?: string;
  read: boolean;
  timestamp: string;
}

export type TimeRangeFilter = 'today' | '7d' | '30d' | '90d';
