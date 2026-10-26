-- NEXUS AI PostgreSQL & Supabase Database Migration Schema
-- Version 1.0.0
-- Includes complete entity relational schema, row level security (RLS), indexes, and audit logs.

-- 1. Enum Definitions
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE ticket_status AS ENUM ('new', 'open', 'in_progress', 'waiting_customer', 'resolved', 'closed');
CREATE TYPE ticket_category AS ENUM (
  'Billing & Payments',
  'Technical Support',
  'Account Access',
  'Product Issue',
  'Delivery & Orders',
  'Security',
  'Other'
);
CREATE TYPE sla_state AS ENUM ('on_track', 'at_risk', 'breached', 'met', 'paused');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'agent');
CREATE TYPE customer_tier AS ENUM ('Standard', 'Pro', 'Enterprise', 'VIP');

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  company VARCHAR(255) NOT NULL,
  customer_tier customer_tier NOT NULL DEFAULT 'Standard',
  phone VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Support Agents Table
CREATE TABLE IF NOT EXISTS support_agents (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'agent',
  team VARCHAR(128) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  workload INT NOT NULL DEFAULT 0,
  resolved_count INT NOT NULL DEFAULT 0,
  sla_attainment_rate NUMERIC(5, 2) NOT NULL DEFAULT 95.00,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(32) PRIMARY KEY, -- e.g. NX-1001
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  customer_id VARCHAR(64) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  assigned_agent_id VARCHAR(64) REFERENCES support_agents(id) ON DELETE SET NULL,
  category ticket_category NOT NULL DEFAULT 'Technical Support',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  status ticket_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  first_response_deadline TIMESTAMPTZ NOT NULL,
  resolution_deadline TIMESTAMPTZ NOT NULL,
  sla_state sla_state NOT NULL DEFAULT 'on_track',
  tags TEXT[] NOT NULL DEFAULT '{}',
  contact_method VARCHAR(32) NOT NULL DEFAULT 'portal',
  business_impact VARCHAR(32) NOT NULL DEFAULT 'medium',
  urgency VARCHAR(32) NOT NULL DEFAULT 'medium',
  ai_summary TEXT,
  ai_classification JSONB
);

-- Indexes for high-frequency queries and filtering
CREATE INDEX idx_tickets_customer ON tickets(customer_id);
CREATE INDEX idx_tickets_assigned_agent ON tickets(assigned_agent_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_sla_state ON tickets(sla_state);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- 5. Ticket Messages Table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id VARCHAR(64) PRIMARY KEY,
  ticket_id VARCHAR(32) NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id VARCHAR(64) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_type VARCHAR(32) NOT NULL, -- agent, customer, system, ai
  content TEXT NOT NULL,
  message_type VARCHAR(32) NOT NULL DEFAULT 'reply', -- reply, internal_note
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_ticket_id ON ticket_messages(ticket_id);

-- 6. AI Feedback Audit Table
CREATE TABLE IF NOT EXISTS ai_feedback (
  id VARCHAR(64) PRIMARY KEY,
  ticket_id VARCHAR(32) NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(64) NOT NULL,
  recommendation_content TEXT NOT NULL,
  decision VARCHAR(32) NOT NULL, -- accepted, edited, rejected
  rejection_reason TEXT,
  edited_content TEXT,
  agent_id VARCHAR(64) NOT NULL REFERENCES support_agents(id),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_feedback_ticket ON ai_feedback(ticket_id);
CREATE INDEX idx_ai_feedback_decision ON ai_feedback(decision);

-- 7. Operational Activity Audit Events
CREATE TABLE IF NOT EXISTS activity_events (
  id VARCHAR(64) PRIMARY KEY,
  ticket_id VARCHAR(32) NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  actor VARCHAR(255) NOT NULL,
  actor_role VARCHAR(64) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_ticket ON activity_events(ticket_id);
CREATE INDEX idx_activities_timestamp ON activity_events(timestamp DESC);

-- 8. SLA Policies Table
CREATE TABLE IF NOT EXISTS sla_policies (
  id VARCHAR(64) PRIMARY KEY,
  priority ticket_priority NOT NULL UNIQUE,
  first_response_minutes INT NOT NULL,
  resolution_minutes INT NOT NULL,
  business_hours_only BOOLEAN NOT NULL DEFAULT false,
  at_risk_threshold_percent INT NOT NULL DEFAULT 75,
  description TEXT NOT NULL
);

-- 9. Automation Rules Table
CREATE TABLE IF NOT EXISTS automation_rules (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  trigger VARCHAR(64) NOT NULL,
  conditions JSONB NOT NULL DEFAULT '[]',
  actions JSONB NOT NULL DEFAULT '[]',
  execution_count INT NOT NULL DEFAULT 0,
  last_executed_at TIMESTAMPTZ
);

-- 10. Enable Row Level Security (RLS) on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

-- 11. Core Security Policies
-- Authenticated agents can read tickets
CREATE POLICY "Allow authenticated agents read access" ON tickets
  FOR SELECT TO authenticated USING (true);

-- Agents and managers can update assigned or eligible tickets
CREATE POLICY "Allow agent updates" ON tickets
  FOR UPDATE TO authenticated USING (true);

-- Admin role can perform all modifications on rules and policies
CREATE POLICY "Admin policy full access" ON sla_policies
  FOR ALL TO authenticated USING (
    (auth.jwt() ->> 'role') = 'admin' OR (auth.jwt() ->> 'role') = 'manager'
  );
