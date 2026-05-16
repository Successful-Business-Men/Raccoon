-- Seagull schema.
--
-- Run this in the Supabase SQL editor after creating a project.
-- DECISION: only authenticated users may persist data. Anonymous users
-- have a session_id in localStorage and never round-trip data through us.

-- ─── extensions ────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── sessions ──────────────────────────────────────────────────────────
-- Optional table for grouping a user's documents / plans by an
-- anonymous browser session that later got linked to an account.
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  anon_session_id text,
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_idx on public.sessions(user_id);
create index if not exists sessions_anon_idx on public.sessions(anon_session_id);

alter table public.sessions enable row level security;

drop policy if exists "sessions self read" on public.sessions;
create policy "sessions self read"
  on public.sessions for select
  using (auth.uid() = user_id);

drop policy if exists "sessions self insert" on public.sessions;
create policy "sessions self insert"
  on public.sessions for insert
  with check (auth.uid() = user_id);

-- ─── saved_documents (incident packets) ────────────────────────────────
create table if not exists public.saved_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  packet jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_documents_user_idx on public.saved_documents(user_id);

alter table public.saved_documents enable row level security;

drop policy if exists "documents self read" on public.saved_documents;
create policy "documents self read"
  on public.saved_documents for select
  using (auth.uid() = user_id);

drop policy if exists "documents self write" on public.saved_documents;
create policy "documents self write"
  on public.saved_documents for insert
  with check (auth.uid() = user_id);

drop policy if exists "documents self update" on public.saved_documents;
create policy "documents self update"
  on public.saved_documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "documents self delete" on public.saved_documents;
create policy "documents self delete"
  on public.saved_documents for delete
  using (auth.uid() = user_id);

-- ─── saved_continuity_plans ────────────────────────────────────────────
create table if not exists public.saved_continuity_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  intake jsonb not null,
  plan jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_continuity_user_idx on public.saved_continuity_plans(user_id);

alter table public.saved_continuity_plans enable row level security;

drop policy if exists "plans self read" on public.saved_continuity_plans;
create policy "plans self read"
  on public.saved_continuity_plans for select
  using (auth.uid() = user_id);

drop policy if exists "plans self write" on public.saved_continuity_plans;
create policy "plans self write"
  on public.saved_continuity_plans for insert
  with check (auth.uid() = user_id);

drop policy if exists "plans self update" on public.saved_continuity_plans;
create policy "plans self update"
  on public.saved_continuity_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "plans self delete" on public.saved_continuity_plans;
create policy "plans self delete"
  on public.saved_continuity_plans for delete
  using (auth.uid() = user_id);

-- ─── updated_at triggers ───────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists touch_saved_documents on public.saved_documents;
create trigger touch_saved_documents
  before update on public.saved_documents
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_saved_plans on public.saved_continuity_plans;
create trigger touch_saved_plans
  before update on public.saved_continuity_plans
  for each row execute function public.touch_updated_at();
