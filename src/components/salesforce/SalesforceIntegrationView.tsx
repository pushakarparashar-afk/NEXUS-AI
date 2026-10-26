import React, { useState } from 'react';
import {
  CloudLightning,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Code,
  Key,
  Database,
  ArrowRightLeft,
} from 'lucide-react';
import { salesforceService, SalesforceOrgConfig } from '@/services/salesforceService';
import { Button } from '@/components/common/Button';

export const SalesforceIntegrationView: React.FC = () => {
  const [config, setConfig] = useState<SalesforceOrgConfig | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  React.useEffect(() => {
    salesforceService.getStatus().then(setConfig);
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await salesforceService.testConnection();
      setTestResult(res);
    } finally {
      setIsTesting(false);
    }
  };

  const sampleCaseMapping = {
    "Salesforce Case": {
      "CaseNumber": "00049210",
      "Subject": "Payment Gateway Timeout in Production",
      "Priority": "High",
      "Status": "Working",
      "AccountId": "0015g00000X9yZA",
      "OwnerId": "0055g00000B2zQA"
    },
    "Mapped Nexus Ticket": {
      "id": "NX-00049210",
      "subject": "Payment Gateway Timeout in Production",
      "priority": "high",
      "status": "in_progress",
      "customerId": "cust-2",
      "assignedAgentId": "agent-1"
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CloudLightning className="w-5 h-5 text-indigo-400" />
            <h1 className="text-2xl font-extrabold text-white">Salesforce & Agentforce Enterprise Gateway</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Bidirectional Case, Account, Contact, and Agentforce Action synchronization architecture.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-slate-400">Status:</span>
          <span className="font-bold text-amber-400 capitalize">
            {config?.connectedState || 'Disconnected (Demo Mode)'}
          </span>
        </div>
      </div>

      {/* Integration Status & Verification Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Salesforce Connected App Boundary</h3>
            <p className="text-xs text-slate-400">OAuth 2.0 Web Server Flow and REST API endpoint bridge</p>
          </div>
          <Button variant="primary" size="sm" onClick={handleTestConnection} isLoading={isTesting}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Test Connection Health</span>
          </Button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-xl border text-xs space-y-1 ${
            testResult.success
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-amber-400" />}
              <span>Verification Result</span>
            </div>
            <p className="text-[11px] leading-relaxed">{testResult.message}</p>
          </div>
        )}

        {/* Configuration Parameter Table */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Salesforce Instance URL</span>
            <div className="font-mono text-slate-200 truncate">{config?.instanceUrl}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Connected App Client ID</span>
            <div className="font-mono text-slate-200 truncate">{config?.clientId}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Agentforce Bridge</span>
            <div className="font-semibold text-cyan-400">Simulated Adapter Ready</div>
          </div>
        </div>
      </div>

      {/* Object Schema Mapping & Payload Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mapping Architecture Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
              SObject to Nexus Entity Schema Mapping
            </h3>
            <p className="text-xs text-slate-400">Canonical data field alignment</p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-slate-300">Case.Subject & Case.Description</span>
              <span className="text-indigo-400 font-bold">➔</span>
              <span className="font-mono text-slate-300">Ticket.subject & description</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-slate-300">Case.Priority (Critical, High, Med, Low)</span>
              <span className="text-indigo-400 font-bold">➔</span>
              <span className="font-mono text-slate-300">Ticket.priority & SLA policy</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-slate-300">Account (Id, Name, SLA_Tier__c)</span>
              <span className="text-indigo-400 font-bold">➔</span>
              <span className="font-mono text-slate-300">Customer (id, company, tier)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-slate-300">Case.OwnerId (Queue or User)</span>
              <span className="text-indigo-400 font-bold">➔</span>
              <span className="font-mono text-slate-300">Ticket.assignedAgentId</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-slate-300">Salesforce Flow / Apex Trigger</span>
              <span className="text-indigo-400 font-bold">➔</span>
              <span className="font-mono text-slate-300">Automation Rule Action Matrix</span>
            </div>
          </div>
        </div>

        {/* JSON Payload Transformation Preview */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
              Live JSON Ingress Payload Transformation
            </h3>
            <p className="text-xs text-slate-400">Sample inbound webhook payload deserialization</p>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800 leading-relaxed">
            {JSON.stringify(sampleCaseMapping, null, 2)}
          </pre>
        </div>
      </div>

      {/* Production Setup Instructions */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs text-slate-300">
        <h3 className="text-sm font-bold text-white">How to Connect an Active Salesforce Org</h3>
        <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-slate-400">
          <li>Create a <strong className="text-slate-200">Connected App</strong> in Salesforce Setup &rarr; App Manager.</li>
          <li>Enable OAuth Settings with scopes: <code className="text-indigo-400">api</code>, <code className="text-indigo-400">refresh_token</code>, <code className="text-indigo-400">offline_access</code>.</li>
          <li>Set the Callback URL to: <code className="text-indigo-400 font-mono">https://&lt;your-domain&gt;/api/auth/salesforce/callback</code>.</li>
          <li>Provide <code className="text-indigo-400">SALESFORCE_CLIENT_ID</code> and <code className="text-indigo-400">SALESFORCE_CLIENT_SECRET</code> in your server environment variables.</li>
        </ol>
      </div>
    </div>
  );
};
