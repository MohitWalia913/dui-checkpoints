-- Remove unused alert settings columns (lead time, notes)

alter table public.user_alert_settings
  drop column if exists alert_lead_time_hours,
  drop column if exists additional_notes;
