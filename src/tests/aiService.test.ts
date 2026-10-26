import { describe, it, expect } from 'vitest';
import { DeterministicMockAIProvider, AIAnalysisResultSchema } from '../services/aiService';
import { Ticket } from '../types';

describe('AI Service & Deterministic Provider', () => {
  const provider = new DeterministicMockAIProvider();

  const mockBaseTicket: Ticket = {
    id: 'NX-9999',
    subject: '',
    description: '',
    customerId: 'cust-1',
    assignedAgentId: null,
    category: 'Other',
    priority: 'medium',
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
    businessImpact: 'medium',
    urgency: 'medium',
  };

  it('correctly labels provider as simulated', () => {
    expect(provider.isRealProvider()).toBe(false);
    expect(provider.getProviderName()).toContain('Simulated');
  });

  it('classifies Billing & Payments issues accurately', async () => {
    const ticket = {
      ...mockBaseTicket,
      subject: 'Duplicate Credit Card Invoice Charge',
      description: 'We were billed twice on our Stripe subscription invoice for $4,950.',
    };

    const result = await provider.analyzeTicket(ticket);
    expect(result.category).toBe('Billing & Payments');
    expect(result.confidence).toBeGreaterThan(0.9);
    // Validates against runtime Zod schema
    expect(() => AIAnalysisResultSchema.parse(result)).not.toThrow();
  });

  it('classifies Security incidents with critical priority and safety warnings', async () => {
    const ticket = {
      ...mockBaseTicket,
      subject: 'Potential Credential Leak & Unauthorized Token Invocation',
      description: 'API key compromised and detected communicating with malicious IP.',
    };

    const result = await provider.analyzeTicket(ticket);
    expect(result.category).toBe('Security');
    expect(result.suggestedPriority).toBe('critical');
    expect(result.safetyWarnings).toBeDefined();
    expect(result.safetyWarnings?.length).toBeGreaterThan(0);
  });

  it('generates a draft customer response with required greetings and questions', async () => {
    const ticket = {
      ...mockBaseTicket,
      subject: 'Database connection pool exhausted',
      description: 'All postgres worker pools fail after 100 concurrent queries.',
    };

    const draft = await provider.generateDraftReply(ticket);
    expect(draft).toContain('Nexus Support');
    expect(draft).toContain(ticket.subject);
    expect(draft.length).toBeGreaterThan(50);
  });
});
