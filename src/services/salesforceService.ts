import { Ticket, Customer } from '@/types';

export interface SalesforceOrgConfig {
  instanceUrl: string;
  clientId: string;
  connectedState: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastSyncAt: string | null;
  agentforceEnabled: boolean;
  activeQueues: string[];
}

export interface ISalesforceSyncProvider {
  getStatus(): Promise<SalesforceOrgConfig>;
  syncCaseToTicket(caseRecord: any): Ticket;
  syncTicketToCase(ticket: Ticket): any;
  testConnection(): Promise<{ success: boolean; message: string }>;
}

export class SalesforceBridgeService implements ISalesforceSyncProvider {
  private config: SalesforceOrgConfig = {
    instanceUrl: 'https://developer-edition.na214.my.salesforce.com',
    clientId: '3MVG9xxxxxxx...NexusClient',
    connectedState: 'disconnected', // Clearly disconnected by default
    lastSyncAt: null,
    agentforceEnabled: false,
    activeQueues: ['Tier 1 Support Queue', 'Tier 2 Escalations Queue', 'Security SOC Queue'],
  };

  public async getStatus(): Promise<SalesforceOrgConfig> {
    return { ...this.config };
  }

  public async testConnection(): Promise<{ success: boolean; message: string }> {
    // In demo mode without actual server-side OAuth refresh token
    return {
      success: false,
      message: 'No live Salesforce Connected App OAuth secret configured. Operating in simulated Salesforce Architecture mode.',
    };
  }

  public syncCaseToTicket(sfCase: any): Ticket {
    // Standard mapping: Salesforce Case -> Nexus Ticket
    return {
      id: `NX-${sfCase.CaseNumber || 'SF'}`,
      subject: sfCase.Subject || 'Untitled Salesforce Case',
      description: sfCase.Description || '',
      customerId: sfCase.AccountId || 'cust-1',
      assignedAgentId: sfCase.OwnerId || null,
      category: this.mapCategory(sfCase.Type),
      priority: this.mapPriority(sfCase.Priority),
      status: this.mapStatus(sfCase.Status),
      createdAt: sfCase.CreatedDate || new Date().toISOString(),
      updatedAt: sfCase.LastModifiedDate || new Date().toISOString(),
      firstResponseAt: null,
      resolvedAt: sfCase.ClosedDate || null,
      firstResponseDeadline: new Date(Date.now() + 3600000).toISOString(),
      resolutionDeadline: new Date(Date.now() + 14400000).toISOString(),
      slaState: 'on_track',
      tags: ['salesforce-sync', sfCase.Origin || 'web'],
      contactMethod: 'portal',
      businessImpact: 'medium',
      urgency: 'medium',
    };
  }

  public syncTicketToCase(ticket: Ticket): any {
    // Mapping: Nexus Ticket -> Salesforce Case SObject
    return {
      attributes: { type: 'Case' },
      Subject: ticket.subject,
      Description: ticket.description,
      Priority: ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1),
      Status: ticket.status === 'resolved' ? 'Closed' : 'Working',
      Origin: 'Nexus AI Command Center',
      Custom_SLA_State__c: ticket.slaState,
    };
  }

  private mapCategory(type: string): any {
    switch (type?.toLowerCase()) {
      case 'billing': return 'Billing & Payments';
      case 'security': return 'Security';
      case 'access': return 'Account Access';
      default: return 'Technical Support';
    }
  }

  private mapPriority(p: string): any {
    switch (p?.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'low': return 'low';
      default: return 'medium';
    }
  }

  private mapStatus(s: string): any {
    switch (s?.toLowerCase()) {
      case 'closed': return 'closed';
      case 'resolved': return 'resolved';
      case 'new': return 'new';
      default: return 'in_progress';
    }
  }
}

export const salesforceService = new SalesforceBridgeService();
