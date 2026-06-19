-- Homebase — Reminders, Nudge, and Weekly Insight support.
-- Run after 0001_init.sql (Supabase SQL editor or `supabase db push`).

-- 1) Per-chore reminder fields ------------------------------------------------
alter table chores add column if not exists reminder_enabled boolean not null default false;
alter table chores add column if not exists reminder_time    time;            -- null => household default
alter table chores add column if not exists last_reminded_at timestamptz;     -- de-dupes reminder sends

-- 2) Web Push subscriptions (one row per opted-in device) ---------------------
create table if not exists push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  member     text not null references members (name) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_member_idx on push_subscriptions (member);

-- 3) Cached weekly insight (one row per week) ---------------------------------
create table if not exists insights (
  week_start date primary key,        -- Monday of the covered week
  text       text not null,
  created_at timestamptz not null default now()
);

-- 4) Household settings (single row) ------------------------------------------
create table if not exists app_settings (
  id                    int primary key default 1 check (id = 1),
  default_reminder_time time not null default '08:00'
);
insert into app_settings (id) values (1) on conflict (id) do nothing;

-- 5) Realtime + RLS -----------------------------------------------------------
alter publication supabase_realtime add table insights;

alter table push_subscriptions enable row level security;
alter table insights           enable row level security;
alter table app_settings       enable row level security;

create policy "push subs readable by authenticated"
  on push_subscriptions for select to authenticated using (true);
create policy "push subs writable by authenticated"
  on push_subscriptions for all to authenticated using (true) with check (true);

create policy "insights readable by authenticated"
  on insights for select to authenticated using (true);
-- insights are written by the Edge Function via the service role, which bypasses RLS.

create policy "settings readable by authenticated"
  on app_settings for select to authenticated using (true);
create policy "settings writable by authenticated"
  on app_settings for all to authenticated using (true) with check (true);

-- 6) Scheduled jobs (pg_cron + pg_net) ---------------------------------------
-- Enable the extensions once per project, then create the schedules. The Edge
-- Functions are invoked over HTTP with the project's SERVICE ROLE key.
-- Replace <PROJECT_REF> and <SERVICE_ROLE_KEY> before running these.
--
--   create extension if not exists pg_cron;
--   create extension if not exists pg_net;
--
--   -- Send due-chore reminders every 15 minutes:
--   select cron.schedule('homebase-send-reminders', '*/15 * * * *', $$
--     select net.http_post(
--       url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-reminders',
--       headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>',
--                                     'Content-Type', 'application/json'),
--       body    := '{}'::jsonb
--     );
--   $$);
--
--   -- Generate the weekly insight every Sunday at 18:00 UTC:
--   select cron.schedule('homebase-weekly-insight', '0 18 * * 0', $$
--     select net.http_post(
--       url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/weekly-insight',
--       headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>',
--                                     'Content-Type', 'application/json'),
--       body    := '{}'::jsonb
--     );
--   $$);
