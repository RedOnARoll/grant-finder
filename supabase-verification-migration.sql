-- Migration: Add verification tracking fields to grants table
-- Run in Supabase SQL editor

ALTER TABLE grants
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS data_source text,
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_notes text;

-- Index for finding stale/unverified rows efficiently
CREATE INDEX IF NOT EXISTS idx_grants_last_verified_at ON grants (last_verified_at);
CREATE INDEX IF NOT EXISTS idx_grants_is_verified ON grants (is_verified);

COMMENT ON COLUMN grants.last_verified_at IS 'Timestamp of last automated verification run';
COMMENT ON COLUMN grants.data_source IS 'Source of data: grants.gov, scraped, manual';
COMMENT ON COLUMN grants.is_verified IS 'Whether this record has been verified against an authoritative source';
COMMENT ON COLUMN grants.verification_notes IS 'Notes from last verification, including any discrepancies found';
