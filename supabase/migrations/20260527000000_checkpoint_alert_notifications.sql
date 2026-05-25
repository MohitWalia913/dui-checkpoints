-- Tracks sent checkpoint alert emails to prevent duplicates (immediate + cron reminders).

create table if not exists public.checkpoint_alert_notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  checkpoint_id bigint not null,
  alert_type text not null check (
    alert_type in ('new_checkpoint', 'upcoming_reminder')
  ),
  sent_at timestamptz not null default now(),
  constraint checkpoint_alert_notifications_unique unique (
    user_id,
    checkpoint_id,
    alert_type
  )
);

create index if not exists idx_checkpoint_alert_notifications_user
  on public.checkpoint_alert_notifications (user_id);

create index if not exists idx_checkpoint_alert_notifications_checkpoint
  on public.checkpoint_alert_notifications (checkpoint_id);

comment on table public.checkpoint_alert_notifications is
  'Dedupes checkpoint alert emails per user, checkpoint, and alert type.';

alter table public.checkpoint_alert_notifications enable row level security;
