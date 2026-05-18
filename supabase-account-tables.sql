create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text default '',
  state text default '',
  household_size text default '',
  annual_income text default '',
  veteran_status text default '',
  disability_status text default '',
  student_status text default '',
  has_children text default '',
  business_owner text default '',
  business_type text default '',
  employee_count text default '',
  annual_revenue text default '',
  rural_location text default '',
  funding_interests text[] not null default '{}',
  profile_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_slug text not null,
  program_type text not null check (program_type in ('grant', 'benefit')),
  status text not null default 'interested' check (status in ('interested', 'applying', 'applied', 'awarded')),
  notes text,
  saved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, program_slug, program_type)
);

create table if not exists public.application_statuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  saved_program_id uuid not null references public.saved_programs(id) on delete cascade,
  status text not null check (status in ('interested', 'applying', 'applied', 'awarded')),
  created_at timestamptz not null default now()
);

create index if not exists saved_programs_user_id_idx on public.saved_programs(user_id);
create index if not exists saved_programs_lookup_idx on public.saved_programs(user_id, program_slug, program_type);
create index if not exists application_statuses_user_id_idx on public.application_statuses(user_id);
create index if not exists application_statuses_saved_program_id_idx on public.application_statuses(saved_program_id);

alter table public.profiles enable row level security;
alter table public.saved_programs enable row level security;
alter table public.application_statuses enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read their own saved programs" on public.saved_programs;
create policy "Users can read their own saved programs"
  on public.saved_programs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own saved programs" on public.saved_programs;
create policy "Users can insert their own saved programs"
  on public.saved_programs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own saved programs" on public.saved_programs;
create policy "Users can update their own saved programs"
  on public.saved_programs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own saved programs" on public.saved_programs;
create policy "Users can delete their own saved programs"
  on public.saved_programs for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read their own status history" on public.application_statuses;
create policy "Users can read their own status history"
  on public.application_statuses for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own status history" on public.application_statuses;
create policy "Users can insert their own status history"
  on public.application_statuses for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.saved_programs
      where saved_programs.id = application_statuses.saved_program_id
        and saved_programs.user_id = auth.uid()
    )
  );
