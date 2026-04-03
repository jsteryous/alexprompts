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
