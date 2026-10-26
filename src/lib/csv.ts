import { Ticket, Customer, SupportAgent } from '@/types';

export function exportTicketsToCsv(
  tickets: Ticket[],
  customers: Customer[],
  agents: SupportAgent[]
) {
  const customerMap = new Map(customers.map(c => [c.id, c.name]));
  const agentMap = new Map(agents.map(a => [a.id, a.name]));

  const headers = [
    'Ticket ID',
    'Subject',
    'Customer',
    'Category',
    'Priority',
    'Status',
    'Assigned Agent',
    'Created At',
    'SLA State',
    'First Response Deadline',
    'Resolution Deadline',
    'Resolved At',
  ];

  const escapeCsv = (val: string | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = tickets.map(t => [
    escapeCsv(t.id),
    escapeCsv(t.subject),
    escapeCsv(customerMap.get(t.customerId) || t.customerId),
    escapeCsv(t.category),
    escapeCsv(t.priority),
    escapeCsv(t.status),
    escapeCsv(t.assignedAgentId ? agentMap.get(t.assignedAgentId) || 'Unassigned' : 'Unassigned'),
    escapeCsv(t.createdAt),
    escapeCsv(t.slaState),
    escapeCsv(t.firstResponseDeadline),
    escapeCsv(t.resolutionDeadline),
    escapeCsv(t.resolvedAt || 'N/A'),
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  downloadBlob(csvContent, `nexus-tickets-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
}

export function exportAnalyticsToCsv(metrics: Record<string, any>) {
  const escapeCsv = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const entries = Object.entries(metrics).map(([key, val]) => `${escapeCsv(key)},${escapeCsv(val)}`);
  const content = ['Metric,Value', ...entries].join('\r\n');
  downloadBlob(content, `nexus-analytics-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
