-- ── workspace-migration.sql ────────────────────────────────────────────────
-- Run in Supabase SQL editor. All statements are idempotent.

-- 1. Add stage column to saved_programs (separate from existing status column)
alter table public.saved_programs
  add column if not exists stage text not null default 'interested'
  check (stage in ('interested', 'applying', 'submitted', 'awarded', 'declined'));

-- 2. workspace_notes — one freeform note per user per grant
create table if not exists public.workspace_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  grant_id uuid not null,
  content text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, grant_id)
);

alter table public.workspace_notes enable row level security;

drop policy if exists "Users manage own workspace notes" on public.workspace_notes;
create policy "Users manage own workspace notes"
  on public.workspace_notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists workspace_notes_user_grant_idx
  on public.workspace_notes (user_id, grant_id);

-- 3. workspace_drafts — one narrative draft per user per grant
create table if not exists public.workspace_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  grant_id uuid not null,
  narrative_text text not null default '',
  generated_at timestamptz not null default now(),
  unique (user_id, grant_id)
);

alter table public.workspace_drafts enable row level security;

drop policy if exists "Users manage own workspace drafts" on public.workspace_drafts;
create policy "Users manage own workspace drafts"
  on public.workspace_drafts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists workspace_drafts_user_grant_idx
  on public.workspace_drafts (user_id, grant_id);

-- 4. workspace_checklist — persisted checkbox state for required documents
create table if not exists public.workspace_checklist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  grant_id uuid not null,
  checked_items int[] not null default '{}',
  updated_at timestamptz not null default now(),
  unique (user_id, grant_id)
);

alter table public.workspace_checklist enable row level security;

drop policy if exists "Users manage own workspace checklist" on public.workspace_checklist;
create policy "Users manage own workspace checklist"
  on public.workspace_checklist for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists workspace_checklist_user_grant_idx
  on public.workspace_checklist (user_id, grant_id);
