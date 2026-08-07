-- Photographylink / Callsheet — initial schema
-- Run this once in the Supabase SQL editor (or via the CLI / MCP) on a fresh
-- project. The app auto-seeds demo companies, photographers, and jobs from
-- lib/data.ts on first read, so no seed rows are needed here.
--
-- Auth here is app-managed (accounts + sessions tables, server-side via the
-- service role key). This keeps the app's existing API/UI untouched. Upgrading
-- to Supabase Auth later means pointing accounts at auth.users — the table
-- shapes are compatible.

-- ------------------------------------------------------------------ companies
create table if not exists public.companies (
  slug             text primary key,
  name             text not null,
  logo_mark        text not null default 'S',
  cover            text not null default '',
  location         text not null default '',
  markets          text[] not null default '{}',
  tagline          text not null default '',
  about            text not null default '',
  accent           text not null default '#e8a94b',
  specialties      text[] not null default '{}',
  rating           numeric not null default 5,
  review_count     int not null default 0,
  shoots_per_month int not null default 0,
  base_day_rate    int not null default 350,
  equipment_policy text not null default 'either',
  equipment_notes  text not null default '',
  wants_equipment  text not null default '',
  wants_experience text not null default '',
  pay_terms        text not null default '',
  perks            text[] not null default '{}',
  offerings        jsonb not null default '[]',
  bench            jsonb not null default '[]',
  members          jsonb not null default '[]',
  clients          jsonb not null default '[]',
  showcase         jsonb not null default '[]',
  owner_id         uuid,
  created_at       timestamptz not null default now()
);

-- --------------------------------------------------------------- photographers
create table if not exists public.photographers (
  slug           text primary key,
  name           text not null,
  avatar         text not null default '',
  cover          text not null default '',
  location       text not null default '',
  radius_miles   int not null default 25,
  headline       text not null default '',
  bio            text not null default '',
  specialties    text[] not null default '{}',
  rating         numeric not null default 5,
  review_count   int not null default 0,
  jobs_completed int not null default 0,
  on_time_rate   int not null default 100,
  response_hours int not null default 2,
  day_rate       int not null default 350,
  half_day_rate  int not null default 200,
  available_now  boolean not null default true,
  experience_years int not null default 0,
  owns_gear      text[] not null default '{}',
  networks       text[] not null default '{}',
  portfolio      jsonb not null default '[]',
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------- jobs
create table if not exists public.jobs (
  id             text primary key,
  company_slug   text not null references public.companies(slug) on delete cascade,
  title          text not null,
  type           text not null,
  address        text not null default '',
  neighborhood   text not null default '',
  shoot_at       text not null default '',
  posted_ago     text not null default 'just now',
  duration_hours numeric not null default 2,
  payout         int not null default 200,
  client_price   int,
  deliverables   text not null default '',
  equipment      text not null default 'byo',
  status          text not null default 'open',
  claimed_by      text,
  claimed_by_name text,
  assigned_to     text,
  date            text,
  client_id       text,
  urgency         text not null default 'standard',
  created_at      timestamptz not null default now()
);
create index if not exists jobs_company_idx on public.jobs (company_slug);
create index if not exists jobs_status_idx on public.jobs (status);

-- ------------------------------------------------------------------ inquiries
create table if not exists public.inquiries (
  id           text primary key,
  company_slug text not null,
  name         text not null,
  email        text not null,
  project_type text not null default 'General',
  message      text not null default '',
  read         boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists inquiries_company_idx on public.inquiries (company_slug);

-- ------------------------------------------------------------------- accounts
create table if not exists public.accounts (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  role              text not null,
  display_name      text not null default '',
  company_slug      text,
  photographer_slug text,
  created_at        timestamptz not null default now()
);

-- ------------------------------------------------------------------- sessions
create table if not exists public.sessions (
  token      uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days'
);

-- ---------------------------------------------------------------------- claim
-- Atomic claim as a single conditional UPDATE. Exactly one caller can flip an
-- open job to claimed; a direct offer can only be claimed by its assignee.
create or replace function public.claim_job(p_id text, p_slug text, p_name text default null)
returns public.jobs
language plpgsql
as $$
declare
  updated public.jobs;
begin
  update public.jobs
     set status = 'claimed',
         claimed_by = p_slug,
         claimed_by_name = coalesce(p_name, claimed_by_name),
         posted_ago = 'just now'
   where id = p_id
     and status = 'open'
     and (assigned_to is null or assigned_to = p_slug)
  returning * into updated;
  return updated; -- null row if it did not qualify
end;
$$;

-- -------------------------------------------------------------------- RLS
-- Public directory tables are readable by anon (for future client-side reads).
-- Everything is written only by the server (service role, which bypasses RLS).
alter table public.companies     enable row level security;
alter table public.photographers enable row level security;
alter table public.jobs          enable row level security;
alter table public.inquiries     enable row level security;
alter table public.accounts      enable row level security;
alter table public.sessions      enable row level security;

drop policy if exists "public read companies" on public.companies;
create policy "public read companies" on public.companies for select using (true);

drop policy if exists "public read photographers" on public.photographers;
create policy "public read photographers" on public.photographers for select using (true);

drop policy if exists "public read jobs" on public.jobs;
create policy "public read jobs" on public.jobs for select using (true);
-- accounts, sessions, inquiries: no anon policies → server-only via service role.
