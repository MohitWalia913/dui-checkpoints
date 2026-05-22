-- Reported checkpoints (user submissions before review / publish to live map)
-- Run in Supabase: SQL Editor → New query → paste → Run

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table if not exists public.checkpoint_reports (
  id bigint generated always as identity primary key,

  -- Reporter (form: reporterName, reporterEmail)
  reporter_name text not null,
  reporter_email text not null,

  -- Checkpoint location & details (form + API body)
  "State" text not null default 'California',
  "County" text not null,
  "City" text not null,
  "Location" text not null,
  "Description" text not null,
  "Date" text not null,
  "Time" text not null,
  "Source" text,
  mapurl text,

  -- Moderation
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null,

  -- Set when approved and copied to live "Checkpoints" table
  approved_checkpoint_id bigint references public."Checkpoints" (id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.checkpoint_reports is
  'User-submitted DUI checkpoint reports; review before publishing to Checkpoints.';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists checkpoint_reports_status_idx
  on public.checkpoint_reports (status);

create index if not exists checkpoint_reports_created_at_idx
  on public.checkpoint_reports (created_at desc);

create index if not exists checkpoint_reports_reporter_email_idx
  on public.checkpoint_reports (reporter_email);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_checkpoint_reports_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists checkpoint_reports_updated_at on public.checkpoint_reports;

create trigger checkpoint_reports_updated_at
  before update on public.checkpoint_reports
  for each row
  execute function public.set_checkpoint_reports_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.checkpoint_reports enable row level security;

-- Public can submit reports (homepage + dashboard form)
create policy "Anyone can insert checkpoint reports"
  on public.checkpoint_reports
  for insert
  to anon, authenticated
  with check (true);

-- Authenticated users can read (tighten later to admin role only)
create policy "Authenticated users can read checkpoint reports"
  on public.checkpoint_reports
  for select
  to authenticated
  using (true);

-- Only authenticated can update (approve/reject) — restrict to admins in production
create policy "Authenticated users can update checkpoint reports"
  on public.checkpoint_reports
  for update
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- Optional: grant service role / API uses service key — anon insert only above
-- ---------------------------------------------------------------------------
