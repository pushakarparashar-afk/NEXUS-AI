import { z } from 'zod';
import { AIAnalysisResult, Ticket, TicketCategory, TicketPriority } from '@/types';

// Runtime Zod schema to validate structured AI output before rendering
export const AIAnalysisResultSchema = z.object({
  category: z.enum([
    'Billing & Payments',
    'Technical Support',
    'Account Access',
    'Product Issue',
    'Delivery & Orders',
    'Security',
    'Other',
  ]),
  suggestedPriority: z.enum(['low', 'medium', 'high', 'critical']),
  summary: z.string().min(5),
  sentiment: z.enum(['positive', 'neutral', 'frustrated', 'urgent']),
  confidence: z.number().min(0).max(1),
  rationale: z.string().min(5),
  recommendedActions: z.array(z.string()),
  suggestedTroubleshooting: z.array(z.string()),
  draftReply: z.string().min(10),
  safetyWarnings: z.array(z.string()).optional(),
  similarTicketIds: z.array(z.string()).optional(),
});

export interface IAIService {
  analyzeTicket(ticket: Ticket, existingTickets?: Ticket[]): Promise<AIAnalysisResult>;
  generateDraftReply(ticket: Ticket, promptDirective?: string): Promise<string>;
  suggestNextActions(ticket: Ticket): Promise<string[]>;
  isRealProvider(): boolean;
  getProviderName(): string;
}

/**
 * Deterministic Mock AI Provider
 * Analyzes real ticket text, keywords, sentiment, urgency markers, and security indicators.
 * Transparently labeled as Simulated AI / Rule-Engine Pattern Matcher.
 */
export class DeterministicMockAIProvider implements IAIService {
  public isRealProvider(): boolean {
    return false;
  }

  public getProviderName(): string {
    return 'Simulated Agentforce Engine (Local Deterministic)';
  }

  public async analyzeTicket(ticket: Ticket, existingTickets: Ticket[] = []): Promise<AIAnalysisResult> {
    // Simulate brief non-blocking realistic latency (500ms)
    await new Promise(res => setTimeout(res, 500));

    const content = `${ticket.subject} ${ticket.description}`.toLowerCase();

    // 1. Category Classification
    let category: TicketCategory = 'Technical Support';
    let catConfidence = 0.88;

    if (/security|breach|vulnerability|exploit|unauthorized|leak|compromised|pen test/.test(content)) {
      category = 'Security';
      catConfidence = 0.98;
    } else if (/invoice|billing|charge|refund|credit card|subscription|payment|pricing|stripe|receipt/.test(content)) {
      category = 'Billing & Payments';
      catConfidence = 0.94;
    } else if (/password|2fa|mfa|sso|login|locked|auth|credentials|reset/.test(content)) {
      category = 'Account Access';
      catConfidence = 0.96;
    } else if (/delivery|shipment|tracking|order|customs|carrier|package|transit/.test(content)) {
      category = 'Delivery & Orders';
      catConfidence = 0.91;
    } else if (/crash|bug|exception|500 error|broken|glitch|ui error|reproduce/.test(content)) {
      category = 'Product Issue';
      catConfidence = 0.89;
    }

    // 2. Priority & Urgency Scoring
    let priority: TicketPriority = 'medium';
    let sentiment: 'positive' | 'neutral' | 'frustrated' | 'urgent' = 'neutral';
    const safetyWarnings: string[] = [];

    if (/security|breach|compromised|leak/.test(content)) {
      priority = 'critical';
      sentiment = 'urgent';
      safetyWarnings.push('Potential Security Incident detected: Sensitive data handling protocol active.');
    } else if (/down|outage|production|emergency|critical|asap|blocked|severely/.test(content)) {
      priority = 'critical';
      sentiment = 'urgent';
    } else if (/urgent|furious|unacceptable|escalat|loss|broken|fail/.test(content)) {
      priority = 'high';
      sentiment = 'frustrated';
    } else if (/help|how to|wondering|question|inquiry/.test(content)) {
      priority = 'low';
      sentiment = 'neutral';
    } else if (/thank|appreciate|great|kudos/.test(content)) {
      sentiment = 'positive';
    }

    // 3. Summarization
    const subjectPrefix = ticket.subject.trim();
    const summary = `Customer is reporting "${subjectPrefix}". Core issue relates to ${category.toLowerCase()} with ${priority.toUpperCase()} operational impact. Initial sentiment detected as ${sentiment.toUpperCase()}.`;

    // 4. Recommended Actions
    const actions: string[] = [];
    if (category === 'Security') {
      actions.push('Immediately escalate to Security Operations Center (SOC) on-call');
      actions.push('Isolate affected user tokens and force credential rotation');
      actions.push('Check audit access logs for suspicious IP addresses');
    } else if (category === 'Billing & Payments') {
      actions.push('Verify Stripe / Payment Gateway transaction ledger for reference');
      actions.push('Check subscription status and credit balance in billing console');
      actions.push('Issue credit memo or initiate refund receipt if within policy');
    } else if (category === 'Account Access') {
      actions.push('Verify caller identity using standard multi-factor verification');
      actions.push('Check SSO directory sync and directory logs');
      actions.push('Trigger password reset link to verified secondary email');
    } else {
      actions.push('Replicate reported steps in staging environment');
      actions.push('Request telemetry logs / browser console output from user');
      actions.push('Consult knowledge article KB-7412 for known mitigation steps');
    }

    // 5. Suggested Troubleshooting
    const troubleshooting: string[] = [
      'Confirm customer application version and browser build',
      'Verify whether issue reproduces across incognito/private browsing mode',
      'Inspect network trace for failed HTTP requests or CORS violations',
    ];

    // 6. Draft Reply
    const draftReply = `Hello,

Thank you for reaching out to Nexus Support regarding "${ticket.subject}".

We understand this issue is ${sentiment === 'urgent' ? 'urgent and impacting your operations' : 'important'} and our engineering team is actively investigating. 

To help us resolve this as quickly as possible:
1. Please confirm if this is currently impacting all team members or specific users.
2. Have you observed any specific error codes or timestamp logs?

We are monitoring your ticket under our priority SLA targets and will provide an update shortly.

Best regards,
Nexus AI Support Operations`;

    // 7. Find Similar Tickets
    const similarTicketIds = existingTickets
      .filter(t => t.id !== ticket.id && (t.category === category || t.priority === priority))
      .slice(0, 3)
      .map(t => t.id);

    const result: AIAnalysisResult = {
      category,
      suggestedPriority: priority,
      summary,
      sentiment,
      confidence: catConfidence,
      rationale: `Classified based on contextual token analysis: keywords matched ${category} patterns with ${sentiment} sentiment indicators.`,
      recommendedActions: actions,
      suggestedTroubleshooting: troubleshooting,
      draftReply,
      safetyWarnings: safetyWarnings.length > 0 ? safetyWarnings : undefined,
      similarTicketIds: similarTicketIds.length > 0 ? similarTicketIds : undefined,
    };

    // Validate with Zod
    return AIAnalysisResultSchema.parse(result);
  }

  public async generateDraftReply(ticket: Ticket, promptDirective?: string): Promise<string> {
    await new Promise(res => setTimeout(res, 400));
    const directiveNote = promptDirective ? `\n(Tailored to: "${promptDirective}")\n` : '';
    return `Hello,\n\nThank you for reaching out to Nexus Support regarding ticket ${ticket.id} (${ticket.subject}).${directiveNote}\nOur support operations team has reviewed the details. We are addressing your inquiry regarding ${ticket.category.toLowerCase()}.\n\nIf you have any updated screenshots or error logs, please reply directly to this thread.\n\nWarm regards,\nNexus Support Operations`;
  }

  public async suggestNextActions(ticket: Ticket): Promise<string[]> {
    await new Promise(res => setTimeout(res, 300));
    if (ticket.status === 'new') {
      return [
        'Acknowledge ticket receipt within First Response SLA target',
        `Assign to dedicated ${ticket.category} queue specialist`,
        'Verify customer enterprise tier entitlement',
      ];
    } else if (ticket.status === 'in_progress') {
      return [
        'Provide progress status update to customer',
        'Request internal engineering review if escalation is required',
        'Verify resolution criteria against acceptance checklist',
      ];
    } else {
      return [
        'Send resolution confirmation note with satisfaction survey',
        'Archive internal investigation notes to knowledge base',
        'Close ticket upon customer confirmation',
      ];
    }
  }
}

export const aiService = new DeterministicMockAIProvider();
