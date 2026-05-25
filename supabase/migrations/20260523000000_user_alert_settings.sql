-- Per-user DUI checkpoint alert preferences (Settings → Alert settings)

create table if not exists public.user_alert_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,

  alerts_enabled boolean not null default true,
  email_notifications boolean not null default true,
  preferred_counties text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_alert_settings is
  'Logged-in user alert preferences for DUI checkpoint notifications.';

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

create policy "Users can read own alert settings"
  on public.user_alert_settings
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own alert settings"
  on public.user_alert_settings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own alert settings"
  on public.user_alert_settings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
