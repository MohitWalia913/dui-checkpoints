-- City/county alert matching (run in Supabase SQL Editor after proximity migration)

alter table public.user_alert_settings
  add column if not exists alert_city text,
  add column if not exists alert_county text,
  add column if not exists use_city_county_alerts boolean not null default false;

comment on column public.user_alert_settings.alert_city is
  'User city for matching new checkpoints when use_city_county_alerts is on.';

comment on column public.user_alert_settings.alert_county is
  'User county for matching new checkpoints when use_city_county_alerts is on.';

comment on column public.user_alert_settings.use_city_county_alerts is
  'When true, email alerts match checkpoint City/County in addition to zip proximity.';
