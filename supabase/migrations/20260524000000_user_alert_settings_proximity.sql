-- user_alert_settings: full setup (safe to re-run in Supabase SQL Editor)
-- Run this file if you see: relation "public.user_alert_settings" does not exist

create table if not exists public.user_alert_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,

  alerts_enabled boolean not null default true,
  email_notifications boolean not null default true,
  preferred_counties text,

  alert_lead_time_hours integer not null default 24
    check (alert_lead_time_hours >= 1 and alert_lead_time_hours <= 168),
  zip_code text,
  email text,
  display_name text,
  alert_city text,
  alert_county text,
  use_city_county_alerts boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Columns for databases that already had the table without proximity fields
alter table public.user_alert_settings
  add column if not exists alert_lead_time_hours integer not null default 24,
  add column if not exists zip_code text,
  add column if not exists email text,
  add column if not exists display_name text,
  add column if not exists alert_city text,
  add column if not exists alert_county text,
  add column if not exists use_city_county_alerts boolean not null default false;

alter table public.user_alert_settings
  alter column alert_lead_time_hours set default 24;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_alert_settings_alert_lead_time_hours_check'
  ) then
    alter table public.user_alert_settings
      add constraint user_alert_settings_alert_lead_time_hours_check
      check (alert_lead_time_hours >= 1 and alert_lead_time_hours <= 168);
  end if;
exception
  when duplicate_object then null;
end $$;

comment on table public.user_alert_settings is
  'Logged-in user alert preferences for DUI checkpoint notifications.';

comment on column public.user_alert_settings.alert_lead_time_hours is
  'Email alert when an upcoming checkpoint is scheduled within this many hours.';

create index if not exists user_alert_settings_updated_at_idx
  on public.user_alert_settings (updated_at desc);

create or replace function public.set_user_alert_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_alert_settings_updated_at on public.user_alert_settings;

create trigger user_alert_settings_updated_at
  before update on public.user_alert_settings
  for each row
  execute function public.set_user_alert_settings_updated_at();

alter table public.user_alert_settings enable row level security;

drop policy if exists "Users can read own alert settings" on public.user_alert_settings;
create policy "Users can read own alert settings"
  on public.user_alert_settings
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own alert settings" on public.user_alert_settings;
create policy "Users can insert own alert settings"
  on public.user_alert_settings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own alert settings" on public.user_alert_settings;
create policy "Users can update own alert settings"
  on public.user_alert_settings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
