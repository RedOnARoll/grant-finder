-- GrantMatch leads table
-- Run this in the Supabase SQL editor before deploying

CREATE TABLE IF NOT EXISTS grantmatch_leads (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email       text        NOT NULL,
  website_url text        NOT NULL,
  scan_data   jsonb,
  created_at  timestamptz DEFAULT now(),
  launched_at timestamptz            -- set when launch email is sent
);

CREATE UNIQUE INDEX IF NOT EXISTS grantmatch_leads_email_idx
  ON grantmatch_leads (email);

-- Disable RLS so the service role key can insert without extra policies
ALTER TABLE grantmatch_leads DISABLE ROW LEVEL SECURITY;
