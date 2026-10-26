import { SlaPolicy, SlaState, Ticket, TicketPriority } from '@/types';

export const DEFAULT_SLA_POLICIES: SlaPolicy[] = [
  {
    id: 'sla-crit',
    priority: 'critical',
    firstResponseMinutes: 60,      // 1 hour
    resolutionMinutes: 240,       // 4 hours
    businessHoursOnly: false,
    atRiskThresholdPercent: 75,
    description: 'Critical P1: 1h First Response, 4h Resolution target (24/7 calendar hours)',
  },
  {
    id: 'sla-high',
    priority: 'high',
    firstResponseMinutes: 120,     // 2 hours
    resolutionMinutes: 480,       // 8 hours
    businessHoursOnly: false,
    atRiskThresholdPercent: 75,
    description: 'High P2: 2h First Response, 8h Resolution target',
  },
  {
    id: 'sla-med',
    priority: 'medium',
    firstResponseMinutes: 480,     // 8 hours
    resolutionMinutes: 1440,      // 24 hours
    businessHoursOnly: false,
    atRiskThresholdPercent: 75,
    description: 'Medium P3: 8h First Response, 24h Resolution target',
  },
  {
    id: 'sla-low',
    priority: 'low',
    firstResponseMinutes: 1440,    // 24 hours
    resolutionMinutes: 4320,      // 72 hours
    businessHoursOnly: false,
    atRiskThresholdPercent: 75,
    description: 'Low P4: 24h First Response, 72h Resolution target',
  },
];

export class SlaEngine {
  private policies: Map<TicketPriority, SlaPolicy>;

  constructor(customPolicies?: SlaPolicy[]) {
    this.policies = new Map();
    const list = customPolicies || DEFAULT_SLA_POLICIES;
    list.forEach(p => this.policies.set(p.priority, p));
  }

  public getPolicy(priority: TicketPriority): SlaPolicy {
    return this.policies.get(priority) || DEFAULT_SLA_POLICIES[2]; // fallback to medium
  }

  public updatePolicy(policy: SlaPolicy) {
    this.policies.set(policy.priority, policy);
  }

  /**
   * Computes the initial deadlines when a ticket is created
   */
  public calculateDeadlines(
    createdAtIso: string,
    priority: TicketPriority,
    businessHoursOnly = false
  ): { firstResponseDeadline: string; resolutionDeadline: string } {
    const policy = this.getPolicy(priority);
    const createdDate = new Date(createdAtIso);

    if (businessHoursOnly || policy.businessHoursOnly) {
      const respDate = this.addBusinessMinutes(createdDate, policy.firstResponseMinutes);
      const resDate = this.addBusinessMinutes(createdDate, policy.resolutionMinutes);
      return {
        firstResponseDeadline: respDate.toISOString(),
        resolutionDeadline: resDate.toISOString(),
      };
    } else {
      const respDate = new Date(createdDate.getTime() + policy.firstResponseMinutes * 60 * 1000);
      const resDate = new Date(createdDate.getTime() + policy.resolutionMinutes * 60 * 1000);
      return {
        firstResponseDeadline: respDate.toISOString(),
        resolutionDeadline: resDate.toISOString(),
      };
    }
  }

  /**
   * Evaluates current ticket SLA state based on timestamps and progress
   */
  public evaluateTicketSlaState(
    ticket: Pick<Ticket, 'status' | 'createdAt' | 'firstResponseAt' | 'resolvedAt' | 'firstResponseDeadline' | 'resolutionDeadline' | 'priority'>,
    now: number = Date.now()
  ): SlaState {
    // If ticket is resolved or closed
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      const resolutionDeadline = new Date(ticket.resolutionDeadline).getTime();
      const resolvedAtTime = ticket.resolvedAt ? new Date(ticket.resolvedAt).getTime() : now;
      return resolvedAtTime <= resolutionDeadline ? 'met' : 'breached';
    }

    // If waiting for customer, SLA can be paused
    if (ticket.status === 'waiting_customer') {
      return 'paused';
    }

    const createdTime = new Date(ticket.createdAt).getTime();
    const resolutionDeadline = new Date(ticket.resolutionDeadline).getTime();
    const firstResponseDeadline = new Date(ticket.firstResponseDeadline).getTime();

    // Check resolution breach
    if (now > resolutionDeadline) {
      return 'breached';
    }

    // Check first response breach if not yet responded
    if (!ticket.firstResponseAt && now > firstResponseDeadline) {
      return 'breached';
    }

    // Check at-risk threshold for resolution
    const policy = this.getPolicy(ticket.priority);
    const totalDuration = resolutionDeadline - createdTime;
    const elapsed = now - createdTime;
    const elapsedPercent = (elapsed / totalDuration) * 100;

    // Remaining time in minutes
    const remainingMinutes = (resolutionDeadline - now) / (1000 * 60);

    // If remaining time is under 45 mins, or elapsed > threshold (e.g. 75%)
    if (elapsedPercent >= policy.atRiskThresholdPercent || remainingMinutes <= 45) {
      return 'at_risk';
    }

    // Check if first response is at risk
    if (!ticket.firstResponseAt) {
      const respTotal = firstResponseDeadline - createdTime;
      const respElapsed = now - createdTime;
      if ((respElapsed / respTotal) * 100 >= policy.atRiskThresholdPercent) {
        return 'at_risk';
      }
    }

    return 'on_track';
  }

  /**
   * Simple business hours calculation (9 AM to 5 PM, Mon-Fri)
   */
  private addBusinessMinutes(startDate: Date, minutesToAdd: number): Date {
    let current = new Date(startDate.getTime());
    let minutesLeft = minutesToAdd;

    while (minutesLeft > 0) {
      // Check weekend (0 = Sunday, 6 = Saturday)
      const day = current.getDay();
      if (day === 0) {
        // Move to Monday 9:00 AM
        current.setDate(current.getDate() + 1);
        current.setHours(9, 0, 0, 0);
        continue;
      }
      if (day === 6) {
        // Move to Monday 9:00 AM
        current.setDate(current.getDate() + 2);
        current.setHours(9, 0, 0, 0);
        continue;
      }

      const hour = current.getHours();
      if (hour < 9) {
        current.setHours(9, 0, 0, 0);
      } else if (hour >= 17) {
        // Next day 9:00 AM
        current.setDate(current.getDate() + 1);
        current.setHours(9, 0, 0, 0);
        continue;
      }

      // Minutes until 5 PM today
      const endOfDay = new Date(current);
      endOfDay.setHours(17, 0, 0, 0);
      const minutesAvailableToday = Math.floor((endOfDay.getTime() - current.getTime()) / (1000 * 60));

      if (minutesLeft <= minutesAvailableToday) {
        current = new Date(current.getTime() + minutesLeft * 60 * 1000);
        minutesLeft = 0;
      } else {
        minutesLeft -= minutesAvailableToday;
        current.setDate(current.getDate() + 1);
        current.setHours(9, 0, 0, 0);
      }
    }

    return current;
  }
}

export const slaService = new SlaEngine();
