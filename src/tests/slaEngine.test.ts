import { describe, it, expect } from 'vitest';
import { SlaEngine, DEFAULT_SLA_POLICIES } from '../services/slaEngine';

describe('SlaEngine', () => {
  const engine = new SlaEngine();

  it('calculates correct deadlines for Critical priority (1h response, 4h resolution)', () => {
    const createdAt = '2026-10-26T10:00:00.000Z';
    const deadlines = engine.calculateDeadlines(createdAt, 'critical');

    const createdTime = new Date(createdAt).getTime();
    const respTime = new Date(deadlines.firstResponseDeadline).getTime();
    const resTime = new Date(deadlines.resolutionDeadline).getTime();

    // 1 hour = 3600000 ms
    expect(respTime - createdTime).toBe(60 * 60 * 1000);
    // 4 hours = 14400000 ms
    expect(resTime - createdTime).toBe(4 * 60 * 60 * 1000);
  });

  it('calculates correct deadlines for Low priority (24h response, 72h resolution)', () => {
    const createdAt = '2026-10-26T10:00:00.000Z';
    const deadlines = engine.calculateDeadlines(createdAt, 'low');

    const createdTime = new Date(createdAt).getTime();
    const respTime = new Date(deadlines.firstResponseDeadline).getTime();
    const resTime = new Date(deadlines.resolutionDeadline).getTime();

    expect(respTime - createdTime).toBe(24 * 60 * 60 * 1000);
    expect(resTime - createdTime).toBe(72 * 60 * 60 * 1000);
  });

  it('detects on_track state when under threshold', () => {
    const createdAt = new Date().toISOString();
    const deadlines = engine.calculateDeadlines(createdAt, 'medium');

    const ticket = {
      status: 'open' as const,
      createdAt,
      firstResponseAt: new Date().toISOString(),
      resolvedAt: null,
      firstResponseDeadline: deadlines.firstResponseDeadline,
      resolutionDeadline: deadlines.resolutionDeadline,
      priority: 'medium' as const,
    };

    const state = engine.evaluateTicketSlaState(ticket);
    expect(state).toBe('on_track');
  });

  it('detects at_risk state when approaching deadline (>75% elapsed)', () => {
    const now = Date.now();
    // Created 3.2 hours ago on a 4 hour SLA (80% elapsed)
    const createdTime = now - 3.2 * 3600 * 1000;
    const createdAt = new Date(createdTime).toISOString();
    const resolutionDeadline = new Date(createdTime + 4 * 3600 * 1000).toISOString();
    const firstResponseDeadline = new Date(createdTime + 1 * 3600 * 1000).toISOString();

    const ticket = {
      status: 'in_progress' as const,
      createdAt,
      firstResponseAt: new Date(createdTime + 0.5 * 3600 * 1000).toISOString(),
      resolvedAt: null,
      firstResponseDeadline,
      resolutionDeadline,
      priority: 'critical' as const,
    };

    const state = engine.evaluateTicketSlaState(ticket, now);
    expect(state).toBe('at_risk');
  });

  it('detects breached state when now > resolutionDeadline', () => {
    const now = Date.now();
    const createdTime = now - 5 * 3600 * 1000;
    const createdAt = new Date(createdTime).toISOString();
    // Deadline was 1 hour ago
    const resolutionDeadline = new Date(now - 1 * 3600 * 1000).toISOString();
    const firstResponseDeadline = new Date(createdTime + 1 * 3600 * 1000).toISOString();

    const ticket = {
      status: 'open' as const,
      createdAt,
      firstResponseAt: new Date(createdTime + 0.5 * 3600 * 1000).toISOString(),
      resolvedAt: null,
      firstResponseDeadline,
      resolutionDeadline,
      priority: 'critical' as const,
    };

    const state = engine.evaluateTicketSlaState(ticket, now);
    expect(state).toBe('breached');
  });

  it('detects met state for resolved tickets within deadline', () => {
    const now = Date.now();
    const createdTime = now - 3 * 3600 * 1000;
    const createdAt = new Date(createdTime).toISOString();
    const resolutionDeadline = new Date(createdTime + 4 * 3600 * 1000).toISOString();
    const resolvedAt = new Date(createdTime + 2 * 3600 * 1000).toISOString();

    const ticket = {
      status: 'resolved' as const,
      createdAt,
      firstResponseAt: new Date(createdTime + 0.5 * 3600 * 1000).toISOString(),
      resolvedAt,
      firstResponseDeadline: new Date(createdTime + 1 * 3600 * 1000).toISOString(),
      resolutionDeadline,
      priority: 'critical' as const,
    };

    const state = engine.evaluateTicketSlaState(ticket, now);
    expect(state).toBe('met');
  });

  it('pauses SLA when waiting for customer response', () => {
    const now = Date.now();
    const ticket = {
      status: 'waiting_customer' as const,
      createdAt: new Date(now - 2 * 3600 * 1000).toISOString(),
      firstResponseAt: new Date(now - 1 * 3600 * 1000).toISOString(),
      resolvedAt: null,
      firstResponseDeadline: new Date(now + 2 * 3600 * 1000).toISOString(),
      resolutionDeadline: new Date(now + 6 * 3600 * 1000).toISOString(),
      priority: 'medium' as const,
    };

    const state = engine.evaluateTicketSlaState(ticket, now);
    expect(state).toBe('paused');
  });
});
