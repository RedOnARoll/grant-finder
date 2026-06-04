-- ── grant-guidelines-migration.sql ─────────────────────────────────────────
-- Run in Supabase SQL editor. Idempotent.
-- Stores extracted NOFO narrative requirements on the grants row so the
-- scrape+extraction only happens once, not on every page load.

alter table public.grants
  add column if not exists narrative_guidelines jsonb,
  add column if not exists guidelines_fetched_at timestamptz;
