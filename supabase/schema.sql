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
