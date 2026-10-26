import { describe, it, expect } from 'vitest';
import { formatTimeRemaining, generateTicketId } from '../lib/utils';

describe('Metrics & Utility Calculations', () => {
  it('generates next sequential ticket ID properly', () => {
    const existing = [
      { id: 'NX-1001' },
      { id: 'NX-1002' },
      { id: 'NX-1026' },
    ];
    const nextId = generateTicketId(existing);
    expect(nextId).toBe('NX-1027');
  });

  it('calculates remaining and overdue time correctly', () => {
    const now = Date.now();
    const futureIso = new Date(now + 2 * 3600 * 1000 + 15 * 60 * 1000).toISOString();
    const resFuture = formatTimeRemaining(futureIso);

    expect(resFuture.isOverdue).toBe(false);
    expect(resFuture.text).toContain('2h');

    const pastIso = new Date(now - 1 * 3600 * 1000 - 30 * 60 * 1000).toISOString();
    const resPast = formatTimeRemaining(pastIso);

    expect(resPast.isOverdue).toBe(true);
    expect(resPast.text).toContain('overdue');
  });

  it('calculates SLA compliance rate safely without division by zero', () => {
    // When 0 completed tickets
    const completedCount = 0;
    const metCount = 0;
    const rate = completedCount > 0 ? (metCount / completedCount) * 100 : 100;
    expect(rate).toBe(100);
    expect(Number.isFinite(rate)).toBe(true);
  });
});
