-- Multi county/city alert selection

alter table public.user_alert_settings
  add column if not exists selected_counties jsonb not null default '[]'::jsonb,
  add column if not exists selected_cities jsonb not null default '[]'::jsonb,
  add column if not exists notify_new_checkpoints boolean not null default true;

comment on column public.user_alert_settings.selected_counties is
  'JSON array of county names to watch for checkpoint alerts.';

comment on column public.user_alert_settings.selected_cities is
  'JSON array of {city, county} objects to watch for checkpoint alerts.';

comment on column public.user_alert_settings.notify_new_checkpoints is
  'When true, email immediately when a new upcoming checkpoint matches selected areas.';
