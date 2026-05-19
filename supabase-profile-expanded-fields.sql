-- ============================================================
-- supabase-profile-expanded-fields.sql
-- Adds the expanded stepped profile fields.
-- Run in Supabase SQL editor before deploying the updated profile form.
-- ============================================================

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
