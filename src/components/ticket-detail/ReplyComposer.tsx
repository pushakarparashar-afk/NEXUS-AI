import React, { useState } from 'react';
import { Send, Lock, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface ReplyComposerProps {
  onSendMessage: (content: string, type: 'reply' | 'internal_note') => void;
  draftFromAI?: string;
}

export const ReplyComposer: React.FC<ReplyComposerProps> = ({
  onSendMessage,
  draftFromAI,
}) => {
  const [tab, setTab] = useState<'reply' | 'internal_note'>('reply');
  const [content, setContent] = useState<string>('');

  const handleApplyAIDraft = () => {
    if (draftFromAI) {
      setContent(draftFromAI);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSendMessage(content.trim(), tab);
    setContent('');
  };

  return (
    <form onSubmit={handleSend} className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setTab('reply')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
              tab === 'reply' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Customer Reply</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('internal_note')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
              tab === 'internal_note' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Internal Note</span>
          </button>
        </div>

        {/* Quick Apply AI Draft */}
        {draftFromAI && (
          <button
            type="button"
            onClick={handleApplyAIDraft}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Insert AI Draft</span>
          </button>
        )}
      </div>

      {/* Text Area */}
      <textarea
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          tab === 'reply'
            ? 'Type a response to the customer (will be delivered via email/portal)...'
            : 'Add private investigation notes for support team members (hidden from customer)...'
        }
        className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
          tab === 'internal_note'
            ? 'border-amber-500/30 focus:border-amber-500'
            : 'border-slate-800 focus:border-indigo-500'
        }`}
      />

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-500">
          {tab === 'reply' ? 'Updates First Response SLA if unacknowledged' : 'Internal notes are strictly audited'}
        </span>
        <Button
          type="submit"
          variant={tab === 'internal_note' ? 'secondary' : 'primary'}
          size="sm"
          disabled={!content.trim()}
          className={tab === 'internal_note' ? 'bg-amber-600 hover:bg-amber-500 text-white border-none' : ''}
        >
          <Send className="w-3.5 h-3.5" />
          <span>{tab === 'reply' ? 'Send Customer Reply' : 'Post Internal Note'}</span>
        </Button>
      </div>
    </form>
  );
};
