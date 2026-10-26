import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Copy,
  Layers,
  Search,
  MessageSquare,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Ticket, AIAnalysisResult } from '@/types';
import { aiService } from '@/services/aiService';
import { PriorityBadge } from '@/components/tickets/PriorityBadge';
import { StatusBadge } from '@/components/tickets/StatusBadge';
import { Button } from '@/components/common/Button';

export const CopilotView: React.FC = () => {
  const { tickets, setSelectedTicket, recordAIFeedback } = useApp();

  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hello, I am your Nexus Agentforce Copilot assistant. Select any ticket to inspect AI-assisted triage, root-cause recommendations, draft replies, and knowledge base lookups.',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState<string>('');

  const currentTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  const handleRunAnalysis = async (t: Ticket) => {
    setIsLoading(true);
    try {
      const res = await aiService.analyzeTicket(t, tickets);
      setAnalysis(res);
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Loaded analysis for ticket ${t.id} (${t.subject}). Category evaluated as "${res.category}" with ${res.suggestedPriority.toUpperCase()} priority recommendation. How can I assist with this incident?`,
        },
      ]);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (currentTicket) {
      handleRunAnalysis(currentTicket);
    }
  }, [selectedTicketId]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || !currentTicket) return;

    const q = inputQuestion.trim();
    setInputQuestion('');
    setChatMessages(prev => [...prev, { sender: 'user', text: q }]);

    // Simulated Copilot intelligence response based on ticket context
    setTimeout(() => {
      let reply = `Based on ticket ${currentTicket.id} (${currentTicket.subject}), our knowledge base suggests checking service dependency metrics and verifying active tenant configurations.`;
      if (/refund|bill|invoice|charge/i.test(q)) {
        reply = `For billing inquiry on ${currentTicket.id}: Under current policy, duplicate transactions within 48h can be reversed with a single authorization void in the Stripe / payment ledger.`;
      } else if (/restart|reboot|deploy|rollback/i.test(q)) {
        reply = `For infrastructure incidents: Ensure upstream load balancer health checks are returning HTTP 200 before draining active connection pools in staging.`;
      } else if (/escalat/i.test(q)) {
        reply = `This ticket has priority ${currentTicket.priority.toUpperCase()}. You can escalate directly to the Tier 3 Critical Escalations on-call engineer using the assignment dropdown.`;
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-cyan-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">Agentforce AI Copilot Workspace</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
              Simulated AI Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Autonomous triage, summarization, root cause hypothesis generation, and next-best-action guidance for support operators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTicketId}
            onChange={(e) => setSelectedTicketId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            {tickets.map(t => (
              <option key={t.id} value={t.id}>
                {t.id}: {t.subject.slice(0, 35)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Ticket Analysis + Copilot Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Structured AI Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          {isLoading ? (
            <div className="p-16 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-sm text-slate-300 font-medium">Running Agentforce multi-agent classification...</p>
            </div>
          ) : analysis && currentTicket ? (
            <div className="space-y-4">
              {/* Ticket Header Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">{currentTicket.id}</span>
                    <PriorityBadge priority={currentTicket.priority} />
                    <StatusBadge status={currentTicket.status} />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setSelectedTicket(currentTicket)}
                  >
                    Open Ticket Detail
                  </Button>
                </div>
                <h3 className="text-base font-bold text-white">{currentTicket.subject}</h3>
                <p className="text-xs text-slate-400 line-clamp-3">{currentTicket.description}</p>
              </div>

              {/* Summarization & Sentiment */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Issue Summarization & Sentiment Analysis
                  </span>
                  <span className="text-xs font-mono text-cyan-400">
                    Confidence: {Math.round(analysis.confidence * 100)}%
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{analysis.summary}</p>
                <div className="flex flex-wrap gap-2 text-xs pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                    Category: {analysis.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium capitalize">
                    Suggested Priority: {analysis.suggestedPriority}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono capitalize">
                    Customer Sentiment: {analysis.sentiment}
                  </span>
                </div>
              </div>

              {/* Recommended Next Actions */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-200 block">Recommended Next Actions</span>
                <div className="space-y-2">
                  {analysis.recommendedActions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Draft Customer Reply */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-200">Generated Draft Customer Response</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(analysis.draftReply)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {analysis.draftReply}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right 5 Columns: Interactive AI Follow-up Chat */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col h-[650px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center gap-2.5">
            <Bot className="w-5 h-5 text-indigo-400" />
            <div>
              <h4 className="text-xs font-bold text-white">Interactive Copilot Assistant</h4>
              <p className="text-[10px] text-slate-400">Ask troubleshooting questions about active tickets</p>
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask Copilot a question about this ticket..."
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Button type="submit" variant="primary" size="sm" disabled={!inputQuestion.trim()}>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
