-- Halvsies (mobile app) — weekly Claude check-in cache.
-- Run after 0003/0004 in the Halvsies Supabase project.
--
-- The web build's 0002 also creates `insights`, but its RLS only allows the
-- `authenticated` role. The mobile app (v1, pre-auth) reads with the `anon`
-- role, so this migration ensures the table exists and grants anon SELECT.

create table if not exists insights (
  week_start date primary key,        -- Monday (UTC) of the covered week
  text       text not null,
  created_at timestamptz not null default now()
);

-- Live update the Balance card when the weekly job writes a fresh note.
do $$
begin
  alter publication supabase_realtime add table insights;
exception
  when duplicate_object then null;  -- already added (e.g. by 0002)
end $$;

alter table insights enable row level security;

-- Anon may read the cached note (tighten to `authenticated` once the auth gate lands).
-- The Edge Function writes via the service role, which bypasses RLS.
drop policy if exists "insights readable by anon" on insights;
create policy "insights readable by anon"
  on insights for select to anon, authenticated using (true);

-- Schedule (run once, after deploying the function + setting ANTHROPIC_API_KEY):
--   create extension if not exists pg_cron;
--   create extension if not exists pg_net;
--   select cron.schedule('halvsies-weekly-insight', '0 18 * * 0', $$
--     select net.http_post(
--       url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/weekly-insight',
--       headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>',
--                                     'Content-Type', 'application/json'),
--       body    := '{}'::jsonb
--     );
--   $$);
