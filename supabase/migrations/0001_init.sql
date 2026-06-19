-- Homebase schema: members, chore categories, chores.
-- Run in the Supabase SQL editor (or via `supabase db push`).

create table if not exists members (
  name  text primary key,             -- 'Meg' | 'Leti'
  color text not null
);

create table if not exists chore_categories (
  id         text primary key,
  name       text not null,
  sort_order int  not null default 0
);

create table if not exists chores (
  id           text primary key,
  category_id  text not null references chore_categories (id) on delete cascade,
  name         text not null,
  frequency    text not null,         -- Daily | Weekly | Bi-Weekly | Monthly | Quarterly | Seasonal | As needed | Ongoing
  owner        text not null,         -- Meg | Leti | Both
  done         boolean not null default false,
  last_done_at timestamptz,
  sort_order   int not null default 0
);

create index if not exists chores_category_idx on chores (category_id);

-- Enable Realtime so both phones see changes live.
alter publication supabase_realtime add table chores;

-- Row-Level Security: any signed-in household member may read/write.
alter table members          enable row level security;
alter table chore_categories enable row level security;
alter table chores           enable row level security;

create policy "members readable by authenticated"
  on members for select to authenticated using (true);

create policy "categories readable by authenticated"
  on chore_categories for select to authenticated using (true);

create policy "chores readable by authenticated"
  on chores for select to authenticated using (true);

create policy "chores writable by authenticated"
  on chores for all to authenticated using (true) with check (true);
