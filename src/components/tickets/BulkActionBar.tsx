import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, UserCheck, RefreshCw, X, Download } from 'lucide-react';
import { SupportAgent, TicketStatus, Ticket } from '@/types';
import { Button } from '@/components/common/Button';

interface BulkActionBarProps {
  selectedIds: string[];
  onClear: () => void;
  agents: SupportAgent[];
  onBulkAssign: (agentId: string) => void;
  onBulkStatus: (status: TicketStatus) => void;
  onExportSelected: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedIds,
  onClear,
  agents,
  onBulkAssign,
  onBulkStatus,
  onExportSelected,
}) => {
  if (selectedIds.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl px-5 py-3 flex flex-wrap items-center gap-4 text-xs text-slate-100 backdrop-blur-md"
      >
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700 font-semibold text-indigo-400">
          <CheckSquare className="w-4 h-4" />
          <span>{selectedIds.length} tickets selected</span>
        </div>

        {/* Bulk Assign */}
        <div className="flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-slate-400" />
          <select
            onChange={(e) => {
              if (e.target.value) {
                onBulkAssign(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
          >
            <option value="" disabled>Assign to agent...</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Bulk Status Update */}
        <div className="flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4 text-slate-400" />
          <select
            onChange={(e) => {
              if (e.target.value) {
                onBulkStatus(e.target.value as TicketStatus);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
          >
            <option value="" disabled>Update status to...</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_customer">Waiting Customer</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Export Selected to CSV */}
        <button
          onClick={onExportSelected}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>

        {/* Dismiss selection */}
        <button
          onClick={onClear}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
