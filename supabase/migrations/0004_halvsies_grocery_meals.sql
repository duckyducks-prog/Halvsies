-- Halvsies (mobile): grocery list, recipes, and weekly meal plan.
-- Run after 0003_halvsies_mobile.sql. Same v1 auth posture (anon allowed; tighten later).

create table if not exists grocery_items (
  id         text primary key,
  name       text not null,
  status     text not null default 'toBuy',  -- toBuy | inCart
  added_by   text not null,                  -- Meg | Leti
  recipe_id  text,                           -- set when added from a recipe
  created_at timestamptz not null default now()
);

create table if not exists recipes (
  id          text primary key,
  name        text not null,
  ingredients jsonb not null default '[]',   -- [{ name, qty? }]
  created_by  text not null
);

create table if not exists meal_entries (
  id                text primary key,
  date              date not null,           -- the dinner's day
  recipe_id         text not null references recipes (id) on delete cascade,
  cook              text,                    -- Meg | Leti | null
  pushed_to_grocery boolean not null default false
);
create index if not exists meal_entries_date_idx on meal_entries (date);

alter publication supabase_realtime add table grocery_items;
alter publication supabase_realtime add table recipes;
alter publication supabase_realtime add table meal_entries;

alter table grocery_items enable row level security;
alter table recipes       enable row level security;
alter table meal_entries  enable row level security;

create policy "grocery rw" on grocery_items for all to anon, authenticated using (true) with check (true);
create policy "recipes rw" on recipes       for all to anon, authenticated using (true) with check (true);
create policy "meals rw"   on meal_entries  for all to anon, authenticated using (true) with check (true);
