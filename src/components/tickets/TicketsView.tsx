import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { TicketFilterBar, FilterState } from './TicketFilterBar';
import { TicketTable } from './TicketTable';
import { TicketKanban } from './TicketKanban';
import { BulkActionBar } from './BulkActionBar';
import { exportTicketsToCsv } from '@/lib/csv';

export const TicketsView: React.FC = () => {
  const {
    tickets,
    agents,
    customers,
    setSelectedTicket,
    updateTicketStatus,
    bulkAssign,
    bulkUpdateStatus,
  } = useApp();

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    agent: 'all',
    slaState: 'all',
  });

  const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c.name.toLowerCase()])), [customers]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Search
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const customerName = customerMap.get(ticket.customerId) || '';
        const matchesId = ticket.id.toLowerCase().includes(q);
        const matchesSubject = ticket.subject.toLowerCase().includes(q);
        const matchesDesc = ticket.description.toLowerCase().includes(q);
        const matchesCustomer = customerName.includes(q);
        if (!matchesId && !matchesSubject && !matchesDesc && !matchesCustomer) {
          return false;
        }
      }

      // Status
      if (filters.status !== 'all' && ticket.status !== filters.status) return false;

      // Priority
      if (filters.priority !== 'all' && ticket.priority !== filters.priority) return false;

      // Category
      if (filters.category !== 'all' && ticket.category !== filters.category) return false;

      // SLA State
      if (filters.slaState !== 'all' && ticket.slaState !== filters.slaState) return false;

      // Agent
      if (filters.agent !== 'all') {
        if (filters.agent === 'unassigned' && ticket.assignedAgentId !== null) return false;
        if (filters.agent !== 'unassigned' && ticket.assignedAgentId !== filters.agent) return false;
      }

      return true;
    });
  }, [tickets, filters, customerMap]);

  const handleExportSelected = () => {
    const selectedTickets = tickets.filter(t => selectedIds.includes(t.id));
    exportTicketsToCsv(selectedTickets.length > 0 ? selectedTickets : filteredTickets, customers, agents);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Filter and Search Bar */}
      <TicketFilterBar
        filters={filters}
        setFilters={setFilters}
        agents={agents}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalFiltered={filteredTickets.length}
      />

      {/* Main View: Table vs Kanban */}
      {viewMode === 'table' ? (
        <TicketTable
          tickets={filteredTickets}
          agents={agents}
          customers={customers}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onSelectTicket={setSelectedTicket}
        />
      ) : (
        <TicketKanban
          tickets={filteredTickets}
          agents={agents}
          customers={customers}
          onSelectTicket={setSelectedTicket}
          onUpdateStatus={updateTicketStatus}
        />
      )}

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
        agents={agents}
        onBulkAssign={(agentId) => {
          bulkAssign(selectedIds, agentId);
          setSelectedIds([]);
        }}
        onBulkStatus={(status) => {
          bulkUpdateStatus(selectedIds, status);
          setSelectedIds([]);
        }}
        onExportSelected={handleExportSelected}
      />
    </div>
  );
};
