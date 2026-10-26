import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Check,
  X,
  Edit2,
  Copy,
  RotateCw,
  AlertTriangle,
  Lightbulb,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Layers,
} from 'lucide-react';
import { Ticket, AIAnalysisResult, AIFeedbackRecord } from '@/types';
import { aiService } from '@/services/aiService';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/common/Button';

interface AICopilotPanelProps {
  ticket: Ticket;
  onApplyDraft?: (draft: string) => void;
  onApplyCategory?: (category: any) => void;
  onApplyPriority?: (priority: any) => void;
}

export const AICopilotPanel: React.FC<AICopilotPanelProps> = ({
  ticket,
  onApplyDraft,
  onApplyCategory,
  onApplyPriority,
}) => {
  const { recordAIFeedback, tickets, setSelectedTicket } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);
  const [rejectionModalType, setRejectionModalType] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [decisions, setDecisions] = useState<{ [key: string]: 'accepted' | 'rejected' | 'edited' }>({});

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await aiService.analyzeTicket(ticket, tickets);
      setAnalysis(result);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [ticket.id]);

  const handleAccept = (type: AIFeedbackRecord['recommendationType'], content: string) => {
    recordAIFeedback({
      ticketId: ticket.id,
      recommendationType: type,
      recommendationContent: content,
      decision: 'accepted',
    });
    setDecisions(prev => ({ ...prev, [type]: 'accepted' }));

    if (type === 'classification' && onApplyCategory && analysis) {
      onApplyCategory(analysis.category);
    }
    if (type === 'priority' && onApplyPriority && analysis) {
      onApplyPriority(analysis.suggestedPriority);
    }
    if (type === 'draft_reply' && onApplyDraft && analysis) {
      onApplyDraft(analysis.draftReply);
    }
  };

  const handleRejectPrompt = (type: AIFeedbackRecord['recommendationType']) => {
    setRejectionModalType(type);
    setRejectionReason('');
  };

  const handleConfirmReject = () => {
    if (!rejectionModalType) return;
    recordAIFeedback({
      ticketId: ticket.id,
      recommendationType: rejectionModalType as any,
      recommendationContent: 'Operator rejected suggestion',
      decision: 'rejected',
      rejectionReason: rejectionReason.trim() || 'Not appropriate for this specific incident',
    });
    setDecisions(prev => ({ ...prev, [rejectionModalType]: 'rejected' }));
    setRejectionModalType(null);
    setRejectionReason('');
  };

  const handleCopyDraft = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-4 text-xs text-slate-100">
      {/* Copilot Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-white">
              <span>Agentforce Copilot</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Simulated AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Contextual assistive reasoning engine</p>
          </div>
        </div>

        <button
          onClick={runAnalysis}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40"
          title="Regenerate Analysis"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center space-y-3">
          <Sparkles className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
          <p className="text-slate-400 text-xs">Analyzing ticket context & incident markers...</p>
        </div>
      ) : analysis ? (
        <div className="space-y-4">
          {/* Safety Warnings if present */}
          {analysis.safetyWarnings && analysis.safetyWarnings.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Security Protocol Warning</span>
              </div>
              <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                {analysis.safetyWarnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Summary Card */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Executive Summary
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {Math.round(analysis.confidence * 100)}% Confidence
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {analysis.summary}
            </p>
            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-800/60">
              <span className="capitalize font-mono">Sentiment: {analysis.sentiment}</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleAccept('summary', analysis.summary)}
                  className={`p-1 rounded ${decisions['summary'] === 'accepted' ? 'text-emerald-400 bg-emerald-500/10' : 'hover:text-emerald-400'}`}
                  title="Accept Summary"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleRejectPrompt('summary')}
                  className={`p-1 rounded ${decisions['summary'] === 'rejected' ? 'text-rose-400 bg-rose-500/10' : 'hover:text-rose-400'}`}
                  title="Reject Summary"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Classification & Priority Rationale */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                Classification & Rationale
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleAccept('classification', `${analysis.category} / ${analysis.suggestedPriority}`)}
                  className={`p-1 rounded ${decisions['classification'] === 'accepted' ? 'text-emerald-400 bg-emerald-500/10' : 'hover:text-emerald-400'}`}
                  title="Accept Classification"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleRejectPrompt('classification')}
                  className={`p-1 rounded ${decisions['classification'] === 'rejected' ? 'text-rose-400 bg-rose-500/10' : 'hover:text-rose-400'}`}
                  title="Reject Classification"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {analysis.category}
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 uppercase font-mono">
                {analysis.suggestedPriority}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              {analysis.rationale}
            </p>
          </div>

          {/* Recommended Next Actions */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="font-semibold text-slate-300 block">Next-Best Actions</span>
            <ul className="space-y-1.5">
              {analysis.recommendedActions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Draft Reply Generator */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Suggested Draft Reply</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopyDraft(analysis.draftReply)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title="Copy Draft to Clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {onApplyDraft && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => {
                      onApplyDraft(analysis.draftReply);
                      handleAccept('draft_reply', analysis.draftReply);
                    }}
                  >
                    Insert
                  </Button>
                )}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-[10px] text-slate-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
              {analysis.draftReply}
            </div>
            {copiedDraft && (
              <span className="text-[10px] text-emerald-400 font-bold block text-right">
                Copied to clipboard!
              </span>
            )}
          </div>

          {/* Similar Tickets Discovery */}
          {analysis.similarTicketIds && analysis.similarTicketIds.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Discovered Similar Tickets
              </span>
              <div className="flex flex-wrap gap-2">
                {analysis.similarTicketIds.map(simId => {
                  const match = tickets.find(t => t.id === simId);
                  return (
                    <button
                      key={simId}
                      onClick={() => match && setSelectedTicket(match)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-indigo-300 border border-slate-700 flex items-center gap-1 transition-colors"
                    >
                      <span>{simId}</span>
                      <span className="text-slate-400 truncate max-w-[120px]">
                        {match?.subject}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Rejection Reason Modal */}
      {rejectionModalType && (
        <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/40 space-y-2 mt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-300">
            <span>Record Rejection Reason ({rejectionModalType})</span>
            <button onClick={() => setRejectionModalType(null)} className="text-slate-400 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Why is this suggestion unsuitable? (e.g. requires manual hardware fix)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setRejectionModalType(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmReject}>
              Submit Feedback
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
