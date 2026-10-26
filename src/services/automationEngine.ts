import { AutomationRule, Ticket, ActivityEvent, InAppNotification } from '@/types';

export const DEFAULT_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'rule-1',
    name: 'Auto-Route Critical Outages to Senior Queue',
    description: 'When a critical ticket is created or updated, automatically assign to Senior Operations Specialist.',
    enabled: true,
    trigger: 'ticket_created',
    conditions: [
      { field: 'priority', operator: 'equals', value: 'critical' },
    ],
    actions: [
      { type: 'assign_agent', payload: { agentId: 'agent-1' } }, // Elena Rostova (Lead)
      { type: 'add_internal_note', payload: { note: 'Auto-routed to Senior On-Call Engineer per Rule #1 (P1 Priority).' } },
      { type: 'send_notification', payload: { title: 'P1 Escalation', message: 'Critical ticket auto-assigned to Senior Queue' } },
    ],
    executionCount: 42,
    lastExecutedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'rule-2',
    name: 'Billing & Invoice Inquiries Routing',
    description: 'Direct any ticket classified under Billing & Payments to the Finance Operations Queue.',
    enabled: true,
    trigger: 'ticket_created',
    conditions: [
      { field: 'category', operator: 'equals', value: 'Billing & Payments' },
    ],
    actions: [
      { type: 'assign_agent', payload: { agentId: 'agent-4' } }, // Lucas Vance (FinOps)
      { type: 'apply_tag', payload: { tag: 'billing-review' } },
    ],
    executionCount: 128,
    lastExecutedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'rule-3',
    name: 'Security Incident Flagging & High Priority Auto-Escalation',
    description: 'Whenever Security category is detected, set priority to Critical and alert compliance officer.',
    enabled: true,
    trigger: 'ticket_created',
    conditions: [
      { field: 'category', operator: 'equals', value: 'Security' },
    ],
    actions: [
      { type: 'set_priority', payload: { priority: 'critical' } },
      { type: 'apply_tag', payload: { tag: 'security-audit-required' } },
      { type: 'send_notification', payload: { title: 'Security Incident Alert', message: 'Security incident flagged for compliance review' } },
    ],
    executionCount: 15,
    lastExecutedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'rule-4',
    name: 'SLA At-Risk Early Warning Notification',
    description: 'When a ticket enters the SLA At-Risk threshold, broadcast an in-app alert to active agents.',
    enabled: true,
    trigger: 'sla_warning',
    conditions: [
      { field: 'slaState', operator: 'equals', value: 'at_risk' },
    ],
    actions: [
      { type: 'send_notification', payload: { title: 'SLA Warning', message: 'Ticket resolution deadline approaching 75% threshold' } },
    ],
    executionCount: 89,
    lastExecutedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

export interface AutomationExecutionResult {
  ruleId: string;
  ruleName: string;
  matched: boolean;
  executedActions: string[];
}

export class AutomationEngine {
  private rules: AutomationRule[] = [];

  constructor(rules: AutomationRule[] = DEFAULT_AUTOMATION_RULES) {
    this.rules = [...rules];
  }

  public getRules(): AutomationRule[] {
    return this.rules;
  }

  public setRules(rules: AutomationRule[]) {
    this.rules = rules;
  }

  public toggleRule(ruleId: string): boolean {
    const r = this.rules.find(x => x.id === ruleId);
    if (r) {
      r.enabled = !r.enabled;
      return r.enabled;
    }
    return false;
  }

  /**
   * Evaluates rules against a ticket in dry-run/test mode without side effects
   */
  public testTicket(ticket: Ticket, trigger: AutomationRule['trigger']): AutomationExecutionResult[] {
    const results: AutomationExecutionResult[] = [];

    for (const rule of this.rules) {
      if (rule.trigger !== trigger) {
        continue;
      }

      const matched = this.evaluateConditions(rule.conditions, ticket);
      const actionDescriptions = rule.actions.map(a => {
        switch (a.type) {
          case 'assign_agent': return `Assign to agent (${a.payload.agentId})`;
          case 'set_priority': return `Set priority to ${a.payload.priority}`;
          case 'set_status': return `Change status to ${a.payload.status}`;
          case 'add_internal_note': return `Add internal note: "${a.payload.note}"`;
          case 'apply_tag': return `Apply tag: #${a.payload.tag}`;
          case 'send_notification': return `Notify: ${a.payload.title}`;
          default: return a.type;
        }
      });

      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        matched,
        executedActions: matched ? actionDescriptions : [],
      });
    }

    return results;
  }

  /**
   * Executes eligible enabled rules against a ticket, modifying ticket state and returning generated activities/notifications
   */
  public execute(
    ticket: Ticket,
    trigger: AutomationRule['trigger']
  ): {
    updatedTicket: Ticket;
    newActivities: ActivityEvent[];
    newNotifications: InAppNotification[];
  } {
    let updatedTicket = { ...ticket };
    const newActivities: ActivityEvent[] = [];
    const newNotifications: InAppNotification[] = [];

    for (const rule of this.rules) {
      if (!rule.enabled || rule.trigger !== trigger) continue;

      const matched = this.evaluateConditions(rule.conditions, updatedTicket);
      if (!matched) continue;

      rule.executionCount += 1;
      rule.lastExecutedAt = new Date().toISOString();

      // Apply actions deterministically
      for (const action of rule.actions) {
        switch (action.type) {
          case 'assign_agent':
            if (action.payload.agentId) {
              updatedTicket.assignedAgentId = action.payload.agentId;
              newActivities.push({
                id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                ticketId: updatedTicket.id,
                actor: 'Automation Engine',
                actorRole: 'System',
                eventType: 'rule_executed',
                description: `Executed Rule "${rule.name}": Assigned to agent ${action.payload.agentId}.`,
                timestamp: new Date().toISOString(),
              });
            }
            break;

          case 'set_priority':
            if (action.payload.priority) {
              updatedTicket.priority = action.payload.priority;
              newActivities.push({
                id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                ticketId: updatedTicket.id,
                actor: 'Automation Engine',
                actorRole: 'System',
                eventType: 'rule_executed',
                description: `Executed Rule "${rule.name}": Escalated priority to ${action.payload.priority}.`,
                timestamp: new Date().toISOString(),
              });
            }
            break;

          case 'apply_tag':
            if (action.payload.tag && !updatedTicket.tags.includes(action.payload.tag)) {
              updatedTicket.tags = [...updatedTicket.tags, action.payload.tag];
            }
            break;

          case 'send_notification':
            newNotifications.push({
              id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              title: action.payload.title || 'Automation Notification',
              message: action.payload.message || `Triggered by Rule: ${rule.name}`,
              type: updatedTicket.priority === 'critical' ? 'critical' : 'info',
              ticketId: updatedTicket.id,
              read: false,
              timestamp: new Date().toISOString(),
            });
            break;

          case 'add_internal_note':
            newActivities.push({
              id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              ticketId: updatedTicket.id,
              actor: 'Automation Engine',
              actorRole: 'System',
              eventType: 'note_added',
              description: action.payload.note,
              timestamp: new Date().toISOString(),
            });
            break;
        }
      }
    }

    return { updatedTicket, newActivities, newNotifications };
  }

  private evaluateConditions(conditions: AutomationRule['conditions'], ticket: Ticket): boolean {
    return conditions.every(cond => {
      const val = (ticket as any)[cond.field];
      switch (cond.operator) {
        case 'equals':
          return String(val).toLowerCase() === String(cond.value).toLowerCase();
        case 'contains':
          return String(val).toLowerCase().includes(String(cond.value).toLowerCase());
        case 'in':
          return Array.isArray(cond.value) && cond.value.includes(val);
        case 'greater_than':
          return Number(val) > Number(cond.value);
        default:
          return false;
      }
    });
  }
}

export const automationService = new AutomationEngine();
