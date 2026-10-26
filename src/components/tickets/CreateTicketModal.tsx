import React, { useState } from 'react';
import { Sparkles, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useApp, CreateTicketDTO } from '@/context/AppContext';
import { TicketCategory, TicketPriority } from '@/types';
import { aiService } from '@/services/aiService';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose }) => {
  const { customers, agents, createTicket } = useApp();

  const [customerId, setCustomerId] = useState<string>(customers[0]?.id || 'cust-1');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<TicketCategory>('Technical Support');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [contactMethod, setContactMethod] = useState<'portal' | 'email' | 'phone' | 'api'>('portal');
  const [businessImpact, setBusinessImpact] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [assignedAgentId, setAssignedAgentId] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>(['web']);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ category: TicketCategory; priority: TicketPriority; rationale: string } | null>(null);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAIAutoClassify = async () => {
    if (!subject.trim()) {
      setErrors(prev => ({ ...prev, subject: 'Please enter a subject first to run AI classification.' }));
      return;
    }

    setIsClassifying(true);
    try {
      const dummyTicket: any = {
        id: 'NX-DRAFT',
        subject,
        description,
        category,
        priority,
      };
      const result = await aiService.analyzeTicket(dummyTicket);
      setCategory(result.category);
      setPriority(result.suggestedPriority);
      setAiSuggestion({
        category: result.category,
        priority: result.suggestedPriority,
        rationale: result.rationale,
      });
    } catch {
      // Graceful fallback
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters long';
    }

    if (!description.trim()) {
      newErrors.description = 'Detailed description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dto: CreateTicketDTO = {
      subject: subject.trim(),
      description: description.trim(),
      customerId,
      category,
      priority,
      contactMethod,
      businessImpact,
      urgency,
      assignedAgentId: assignedAgentId ? assignedAgentId : null,
      tags,
    };

    createTicket(dto);

    // Reset form
    setSubject('');
    setDescription('');
    setTags(['web']);
    setErrors({});
    setAiSuggestion(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Support Ticket"
      description="Ingest customer issue, auto-calculate SLA deadlines, and trigger automation routing."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer & Contact Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Customer Account <span className="text-rose-400">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.company} ({c.customerTier})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Contact Ingress Method
            </label>
            <select
              value={contactMethod}
              onChange={(e) => setContactMethod(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="portal">Customer Web Portal</option>
              <option value="email">Support Email Inbound</option>
              <option value="api">Enterprise REST API</option>
              <option value="phone">Phone / Voice Line</option>
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">
              Subject <span className="text-rose-400">*</span>
            </label>
            <button
              type="button"
              onClick={handleAIAutoClassify}
              disabled={isClassifying || !subject.trim()}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isClassifying ? 'Analyzing text...' : 'AI Suggest Category & Priority'}</span>
            </button>
          </div>
          <input
            type="text"
            placeholder="e.g. Production Webhook Ingress Failing with 502 Bad Gateway"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) setErrors(prev => ({ ...prev, subject: '' }));
            }}
            className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-xs text-white focus:outline-none transition-colors ${
              errors.subject ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
            }`}
          />
          {errors.subject && (
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.subject}
            </p>
          )}
        </div>

        {/* AI Suggestion Banner if triggered */}
        {aiSuggestion && (
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-xs text-cyan-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Simulated AI Classification Applied:</span>
            </div>
            <p className="text-[11px] text-cyan-300">{aiSuggestion.rationale}</p>
            <div className="flex gap-2 text-[10px] font-mono pt-1">
              <span className="bg-cyan-500/20 px-1.5 py-0.5 rounded">Category: {aiSuggestion.category}</span>
              <span className="bg-cyan-500/20 px-1.5 py-0.5 rounded uppercase">Priority: {aiSuggestion.priority}</span>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Detailed Issue Description <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Provide context, error messages, impacted users, and replication steps..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
            }}
            className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-xs text-white focus:outline-none transition-colors ${
              errors.description ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
            }`}
          />
          {errors.description && (
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.description}
            </p>
          )}
        </div>

        {/* Category, Priority, Assignee */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Technical Support">Technical Support</option>
              <option value="Billing & Payments">Billing & Payments</option>
              <option value="Account Access">Account Access</option>
              <option value="Product Issue">Product Issue</option>
              <option value="Security">Security</option>
              <option value="Delivery & Orders">Delivery & Orders</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="low">Low (72h SLA)</option>
              <option value="medium">Medium (24h SLA)</option>
              <option value="high">High (8h SLA)</option>
              <option value="critical">Critical (4h SLA)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Assign Agent
            </label>
            <select
              value={assignedAgentId}
              onChange={(e) => setAssignedAgentId(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Auto-Assign / Queue</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Urgency & Business Impact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Customer Urgency
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as any)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
            >
              <option value="low">Low — General inquiry</option>
              <option value="medium">Medium — Impairment present</option>
              <option value="high">High — Work completely stopped</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Business Impact
            </label>
            <select
              value={businessImpact}
              onChange={(e) => setBusinessImpact(e.target.value as any)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
            >
              <option value="low">Low — Single user</option>
              <option value="medium">Medium — Department impacted</option>
              <option value="high">High — Core revenue flow affected</option>
              <option value="critical">Critical — Total enterprise outage</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Tags & Labels
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Add tag (e.g. outage, invoice) and press Add"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleAddTag}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-rose-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            <Plus className="w-4 h-4" />
            <span>Create Ticket</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
