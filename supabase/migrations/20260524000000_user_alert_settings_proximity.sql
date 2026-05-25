-- Proximity alerts: lead time, contact fields for email delivery

alter table public.user_alert_settings
  add column if not exists alert_lead_time_hours integer not null default 24
    check (alert_lead_time_hours >= 1 and alert_lead_time_hours <= 168),
  add column if not exists zip_code text,
  add column if not exists email text,
  add column if not exists display_name text;

comment on column public.user_alert_settings.alert_lead_time_hours is
  'Email alert when an upcoming checkpoint is scheduled within this many hours.';
