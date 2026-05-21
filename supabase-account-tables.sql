create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text default '',
  email text default '',
  zip_code text default '',
  state text default '',
  date_of_birth text default '',
  phone_number text default '',
  household_size text default '',
  annual_income text default '',
  income_source text default '',
  home_ownership text default '',
  veteran_status text default '',
  disability_status text default '',
  gender text default '',
  race_ethnicity text default '',
  citizenship_status text default '',
  tribal_affiliation text default '',
  student_status text default '',
  has_children text default '',
  education_level text default '',
  field_of_study text default '',
  degree_type_pursuing text default '',
  business_owner text default '',
  business_type text default '',
  business_industry text default '',
  employee_count text default '',
  annual_revenue text default '',
  years_in_operation text default '',
  business_location text default '',
  business_ownership_identities text[] not null default '{}',
  business_us_owned text default '',
  business_rural text default '',
  rural_location text default '',
  funding_interests text[] not null default '{}',
  application_stage text default '',
  email_alerts text default '',
  deadline_reminders text default '',
  weekly_digest text default '',
  is_premium boolean default false,
  is_admin boolean default false,
  subscription_tier text default 'free',
  subscription_status text,
  one_time_credits integer default 0,
  stripe_customer_id text,
  stripe_subscription_id text,
  cancel_at_period_end boolean default false,
  current_period_end timestamptz,
  profile_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text default '';
alter table public.profiles add column if not exists zip_code text default '';
alter table public.profiles add column if not exists date_of_birth text default '';
alter table public.profiles add column if not exists phone_number text default '';
alter table public.profiles add column if not exists income_source text default '';
alter table public.profiles add column if not exists home_ownership text default '';
alter table public.profiles add column if not exists gender text default '';
alter table public.profiles add column if not exists race_ethnicity text default '';
alter table public.profiles add column if not exists citizenship_status text default '';
alter table public.profiles add column if not exists tribal_affiliation text default '';
alter table public.profiles add column if not exists education_level text default '';
alter table public.profiles add column if not exists field_of_study text default '';
alter table public.profiles add column if not exists degree_type_pursuing text default '';
alter table public.profiles add column if not exists business_industry text default '';
alter table public.profiles add column if not exists years_in_operation text default '';
alter table public.profiles add column if not exists business_location text default '';
alter table public.profiles add column if not exists business_ownership_identities text[] not null default '{}';
alter table public.profiles add column if not exists business_us_owned text default '';
alter table public.profiles add column if not exists business_rural text default '';
alter table public.profiles add column if not exists application_stage text default '';
alter table public.profiles add column if not exists email_alerts text default '';
alter table public.profiles add column if not exists deadline_reminders text default '';
alter table public.profiles add column if not exists weekly_digest text default '';
alter table public.profiles add column if not exists is_premium boolean default false;
alter table public.profiles add column if not exists is_admin boolean default false;
alter table public.profiles add column if not exists subscription_tier text default 'free';
alter table public.profiles add column if not exists subscription_status text;
alter table public.profiles add column if not exists one_time_credits integer default 0;
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists stripe_subscription_id text;
alter table public.profiles add column if not exists cancel_at_period_end boolean default false;
alter table public.profiles add column if not exists current_period_end timestamptz;

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
