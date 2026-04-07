-- Upstate Multiplier — market_signals table
-- Run this in the Supabase SQL editor to set up the schema.

CREATE TABLE IF NOT EXISTS market_signals (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL    DEFAULT now(),
  timestamp   timestamptz NOT NULL,
  event_type  text        NOT NULL,   -- PROPERTY TRANSFER | NEW BUSINESS FILING | INDUSTRIAL PERMIT
  location    text        NOT NULL,
  entity_name text        NOT NULL,
  valuation   numeric,                -- dollar amount if known
  detail      text        NOT NULL,
  score       integer     NOT NULL    DEFAULT 50,  -- 0–100 priority score
  tag         text        NOT NULL    DEFAULT 'WARM', -- HOT | WARM | COLD
  source      text        NOT NULL    DEFAULT 'manual' -- deeds | sos | permits | demo
);

-- Enable realtime so the React component receives live inserts
ALTER PUBLICATION supabase_realtime ADD TABLE market_signals;

-- Row Level Security: allow public reads (the feed is visible on the homepage)
ALTER TABLE market_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read"
  ON market_signals
  FOR SELECT
  USING (true);

-- Fix: rename detail → details to match application code
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'market_signals' AND column_name = 'detail'
  ) THEN
    ALTER TABLE market_signals RENAME COLUMN detail TO details;
  END IF;
END $$;

-- Add columns referenced in code but missing from original schema
ALTER TABLE market_signals
  ADD COLUMN IF NOT EXISTS source_url  text,
  ADD COLUMN IF NOT EXISTS status      text,
  ADD COLUMN IF NOT EXISTS source_key  text;  -- dedup key: "deeds:GRANTEE:MM/DD/YYYY" or SOS entity URL

-- Unique constraint for deduplication — PostgREST requires a constraint (not just an index)
-- for ON CONFLICT upsert. PostgreSQL allows multiple NULLs in a UNIQUE constraint
-- (NULL != NULL), so demo signals with source_key=NULL always insert freely.
ALTER TABLE market_signals
  ADD CONSTRAINT IF NOT EXISTS market_signals_source_key_unique UNIQUE (source_key);

-- signal_type: distinguishes mortgage filings from deed/SOS signals.
-- enrich.py checks signal_type = 'MORTGAGE_FILING' to prioritise OCR signature extraction.
-- NULL for all legacy / deed / SOS signals — backward-compatible.
ALTER TABLE market_signals
  ADD COLUMN IF NOT EXISTS signal_type text;  -- MORTGAGE_FILING | null

-- Index for the live feed query
CREATE INDEX IF NOT EXISTS market_signals_timestamp_idx
  ON market_signals (timestamp DESC);

-- ─────────────────────────────────────────────
-- Blog / Market Insights — blog_posts table
-- Run this block in the Supabase SQL editor.
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blog_posts (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL    DEFAULT now(),
  updated_at   timestamptz NOT NULL    DEFAULT now(),
  title        text        NOT NULL,
  slug         text        NOT NULL UNIQUE,
  body_md      text        NOT NULL,   -- full article in Markdown
  summary      text,                   -- one-paragraph excerpt shown in listings
  tags         text[]      NOT NULL    DEFAULT '{}',
  status       text        NOT NULL    DEFAULT 'DRAFT', -- DRAFT | APPROVED | PUBLISHED
  published_at timestamptz,
  author       text        NOT NULL    DEFAULT 'REBB Advisors',
  topic        text,                   -- the prompt/topic passed to generate_insights
  gemini_model text                    -- e.g. gemini-1.5-pro
);

-- Only publicly expose PUBLISHED posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published"
  ON blog_posts
  FOR SELECT
  USING (status = 'PUBLISHED');

-- Allow service-role writes (scraper / approve_post.py bypass RLS)
-- No extra policy needed — the service role key bypasses RLS by default.

-- Automatically update updated_at on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Index for listing page query (published, newest first)
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx
  ON blog_posts (published_at DESC NULLS LAST)
  WHERE status = 'PUBLISHED';

-- ─────────────────────────────────────────────────────────────────────────────
-- Upstate Multiplier — Paying Clients
-- ─────────────────────────────────────────────────────────────────────────────
-- Each row = one paying REBB client (e.g. "Greenville HVAC Co").
-- The token is used for token-gated dashboard URLs: /dashboard?client=slug&token=xxx

CREATE TABLE IF NOT EXISTS clients (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL    DEFAULT now(),
  name          text        NOT NULL,                         -- "Greenville HVAC Co"
  slug          text        NOT NULL UNIQUE,                  -- URL-safe identifier
  token         text        NOT NULL,                         -- secret for dashboard access
  trade_tags    text[]      NOT NULL    DEFAULT '{}',         -- hvac | landscaping | electrical | cleaning | security
  contact_name  text,                                         -- owner/decision-maker at client company
  contact_email text,
  status        text        NOT NULL    DEFAULT 'trial',      -- trial | active | inactive
  notes         text
);

-- No public access — service key only
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- Upstate Multiplier — Enriched Leads (The Premium / Human Layer)
-- ─────────────────────────────────────────────────────────────────────────────
-- Linked to market_signals. Stores the unmasked human behind the LLC.
-- NOT publicly readable — the paid product.

CREATE TABLE IF NOT EXISTS enriched_leads (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         timestamptz NOT NULL    DEFAULT now(),
  updated_at         timestamptz NOT NULL    DEFAULT now(),

  -- Link back to the raw trigger event
  signal_id          uuid        REFERENCES market_signals(id) ON DELETE SET NULL,

  -- Which paying client this lead is routed to (null = unassigned / in queue)
  client_id          uuid        REFERENCES clients(id) ON DELETE SET NULL,

  -- The unmasked human
  principal_name     text,                   -- "Marcus Lee"
  principal_role     text,                   -- "Manager" | "CEO" | "Registered Agent"
  contact_email      text,
  contact_phone      text,
  linkedin_url       text,

  -- Evidence trail — URL to the SC SOS filing, deed page, or Google result used
  search_evidence    text,

  -- Enrichment pipeline status
  enrichment_status  text        NOT NULL    DEFAULT 'raw',   -- raw | pending | enriched

  -- Trade relevance (drives client routing)
  trade_tag          text,                   -- hvac | landscaping | electrical | cleaning | security

  -- Copied from signal for convenience (avoids joins in most queries)
  event_type         text,
  location           text,
  valuation          numeric,
  score              integer,
  tag                text,                   -- HOT | WARM | COLD

  -- Freetext for manual research notes
  notes              text
);

-- No public access — service key only
ALTER TABLE enriched_leads ENABLE ROW LEVEL SECURITY;

-- Auto-update updated_at
CREATE TRIGGER enriched_leads_updated_at
  BEFORE UPDATE ON enriched_leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS enriched_leads_client_id_idx
  ON enriched_leads (client_id);

CREATE INDEX IF NOT EXISTS enriched_leads_status_idx
  ON enriched_leads (enrichment_status);

CREATE INDEX IF NOT EXISTS enriched_leads_signal_id_idx
  ON enriched_leads (signal_id);

CREATE INDEX IF NOT EXISTS enriched_leads_tag_idx
  ON enriched_leads (tag, score DESC)
  WHERE enrichment_status = 'enriched';
