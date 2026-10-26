import React, { useState } from 'react';
import {
  Users,
  Search,
  Building,
  Mail,
  Phone,
  Ticket as TicketIcon,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Customer, CustomerTier, Ticket } from '@/types';
import { PriorityBadge } from '@/components/tickets/PriorityBadge';
import { StatusBadge } from '@/components/tickets/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/common/Button';

export const CustomerDirectoryView: React.FC = () => {
  const { customers, tickets, setSelectedTicket } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const customerTickets = selectedCustomer
    ? tickets.filter(t => t.customerId === selectedCustomer.id)
    : [];

  const openTickets = customerTickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');
  const resolvedTickets = customerTickets.filter(t => t.status === 'resolved' || t.status === 'closed');

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-indigo-400" />
            <h1 className="text-2xl font-extrabold text-white">Customer Account Directory</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Account tiers, enterprise entitlements, contact profiles, and historical ticket logs.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search accounts & companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Main Grid: Directory List + Selected Customer Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Directory List */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden divide-y divide-slate-800">
          <div className="p-3 bg-slate-950/60 font-semibold text-xs text-slate-400">
            Accounts ({filteredCustomers.length})
          </div>

          <div className="max-h-[650px] overflow-y-auto divide-y divide-slate-800/60">
            {filteredCustomers.map(customer => {
              const count = tickets.filter(t => t.customerId === customer.id).length;
              const isSelected = selectedCustomer?.id === customer.id;

              return (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-indigo-950/30 border-l-4 border-indigo-500' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="space-y-1 truncate pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs truncate">{customer.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                        {customer.customerTier}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 truncate flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-500" />
                      {customer.company}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                      {count} tickets
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 7 Cols: Selected Customer Detail Workspace */}
        <div className="lg:col-span-7 space-y-4">
          {selectedCustomer ? (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">{selectedCustomer.name}</h2>
                      <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                        {selectedCustomer.customerTier} Tier
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>{selectedCustomer.company}</span>
                    </div>
                  </div>

                  <div className="flex gap-4 text-center">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-lg font-bold text-indigo-400">{openTickets.length}</div>
                      <div className="text-[10px] text-slate-500 uppercase">Open</div>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-lg font-bold text-emerald-400">{resolvedTickets.length}</div>
                      <div className="text-[10px] text-slate-500 uppercase">Resolved</div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="truncate">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{selectedCustomer.phone || 'No phone recorded'}</span>
                  </div>
                </div>
              </div>

              {/* Customer Ticket History */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Incident History ({customerTickets.length})
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {customerTickets.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No tickets recorded for this customer account.
                    </div>
                  ) : (
                    customerTickets.map(t => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between text-xs transition-colors group"
                      >
                        <div className="space-y-1 truncate pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-indigo-400 font-bold">{t.id}</span>
                            <PriorityBadge priority={t.priority} />
                            <StatusBadge status={t.status} />
                          </div>
                          <h4 className="font-medium text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                            {t.subject}
                          </h4>
                          <span className="text-[10px] text-slate-500 block">
                            Created {formatDate(t.createdAt)}
                          </span>
                        </div>

                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-white flex-shrink-0" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
              Select a customer from the left to view profile and ticket history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
