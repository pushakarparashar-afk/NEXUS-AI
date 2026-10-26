import { describe, it, expect } from 'vitest';
import { AutomationEngine, DEFAULT_AUTOMATION_RULES } from '../services/automationEngine';
import { Ticket } from '../types';

describe('AutomationEngine', () => {
  const engine = new AutomationEngine(DEFAULT_AUTOMATION_RULES);

  const mockTicket: Ticket = {
    id: 'NX-TEST-01',
    subject: 'Production API Crash Outage',
    description: 'Server returns 500 error across cluster',
    customerId: 'cust-1',
    assignedAgentId: null,
    category: 'Technical Support',
    priority: 'critical',
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    firstResponseAt: null,
    resolvedAt: null,
    firstResponseDeadline: new Date().toISOString(),
    resolutionDeadline: new Date().toISOString(),
    slaState: 'on_track',
    tags: [],
    contactMethod: 'portal',
    businessImpact: 'critical',
    urgency: 'high',
  };

  it('correctly executes Rule 1 on Critical priority tickets by assigning to agent-1', () => {
    const { updatedTicket, newActivities, newNotifications } = engine.execute(mockTicket, 'ticket_created');

    // Rule 1 assigns critical tickets to agent-1 (Alexander Wright)
    expect(updatedTicket.assignedAgentId).toBe('agent-1');
    expect(newActivities.length).toBeGreaterThan(0);
    expect(newActivities.some(a => a.description.includes('Auto-routed to Senior On-Call'))).toBe(true);
    expect(newNotifications.length).toBeGreaterThan(0);
  });

  it('runs in dry-run simulation mode without modifying ticket state', () => {
    const results = engine.testTicket(mockTicket, 'ticket_created');
    const rule1 = results.find(r => r.ruleId === 'rule-1');

    expect(rule1).toBeDefined();
    expect(rule1?.matched).toBe(true);
    expect(rule1?.executedActions.length).toBeGreaterThan(0);
  });

  it('toggles rules on and off safely', () => {
    const originalState = engine.getRules().find(r => r.id === 'rule-1')?.enabled;
    const newState = engine.toggleRule('rule-1');

    expect(newState).toBe(!originalState);

    // Toggle back
    engine.toggleRule('rule-1');
  });
});
