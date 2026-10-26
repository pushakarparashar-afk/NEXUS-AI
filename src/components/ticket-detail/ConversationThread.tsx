import React from 'react';
import { User, Shield, Lock, Sparkles } from 'lucide-react';
import { TicketMessage } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

interface ConversationThreadProps {
  messages: TicketMessage[];
}

export const ConversationThread: React.FC<ConversationThreadProps> = ({ messages }) => {
  if (messages.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
        No conversation messages recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {messages.map((msg) => {
        const isCustomer = msg.authorType === 'customer';
        const isInternalNote = msg.messageType === 'internal_note';

        return (
          <div
            key={msg.id}
            className={`p-4 rounded-xl border text-xs text-slate-200 transition-colors ${
              isInternalNote
                ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                : isCustomer
                ? 'bg-slate-900/90 border-slate-800'
                : 'bg-indigo-950/20 border-indigo-500/30'
            }`}
          >
            {/* Message Header */}
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                    isInternalNote
                      ? 'bg-amber-500/20 text-amber-400'
                      : isCustomer
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-indigo-500/20 text-indigo-400'
                  }`}
                >
                  {isInternalNote ? (
                    <Lock className="w-3 h-3" />
                  ) : isCustomer ? (
                    <User className="w-3 h-3" />
                  ) : (
                    <Shield className="w-3 h-3" />
                  )}
                </div>
                <div>
                  <span className="font-semibold text-white">{msg.authorName}</span>
                  <span className="ml-1.5 text-[10px] opacity-75">
                    {isInternalNote
                      ? '• Internal Team Note'
                      : isCustomer
                      ? '• Customer Contact'
                      : '• Support Agent Reply'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {formatRelativeTime(msg.timestamp)}
              </span>
            </div>

            {/* Message Body */}
            <div className="whitespace-pre-wrap leading-relaxed text-slate-300">
              {msg.content}
            </div>
          </div>
        );
      })}
    </div>
  );
};
