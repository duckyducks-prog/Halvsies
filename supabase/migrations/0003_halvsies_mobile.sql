-- Halvsies (mobile app) schema: tasks + completions.
-- Run this in the Supabase SQL editor for the mobile app. (The web reference app's
-- 0001/0002 are separate and not required for Halvsies.)
--
-- Auth note: v1 has no sign-in yet, so policies allow the anon role (the app ships
-- the RLS-protected anon key). Tighten to `authenticated` once the magic-link gate lands.

create table if not exists tasks (
  id               text primary key,
  area_id          text not null,
  name             text not null,
  frequency        text not null,          -- Daily | Weekly | Bi-Weekly | Monthly | Quarterly | Seasonal | As needed | Ongoing
  owner            text not null,          -- Meg | Leti | Both
  last_done_at     timestamptz,
  note             text,
  reminder_enabled boolean not null default false,
  reminder_time    time,
  sort_order       int not null default 0
);

create table if not exists completions (
  id        text primary key,
  task_id   text not null references tasks (id) on delete cascade,
  member    text not null,                 -- Meg | Leti
  at        timestamptz not null default now()
);
create index if not exists completions_task_idx on completions (task_id);
create index if not exists completions_at_idx on completions (at);

-- Live sync for both phones.
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table completions;

-- RLS (anon allowed for v1 — see note above).
alter table tasks       enable row level security;
alter table completions enable row level security;

create policy "tasks readable"  on tasks       for select to anon, authenticated using (true);
create policy "tasks writable"  on tasks       for all    to anon, authenticated using (true) with check (true);
create policy "comps readable"  on completions for select to anon, authenticated using (true);
create policy "comps writable"  on completions for all    to anon, authenticated using (true) with check (true);
