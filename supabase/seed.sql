-- Seed data for Homebase, imported from the original Chore Tracker sheet.
-- Run after 0001_init.sql. Safe to re-run (upserts on primary key).

insert into members (name, color) values
  ('Meg', '#0ea5e9'),
  ('Leti', '#e11d48')
on conflict (name) do update set color = excluded.color;

insert into chore_categories (id, name, sort_order) values
  ('cat-weekly-cleaning', 'Weekly Cleaning', 0),
  ('cat-laundry',         'Laundry', 1),
  ('cat-kitchen',         'Kitchen', 2),
  ('cat-bathrooms',       'Bathrooms (2)', 3),
  ('cat-dogs',            'Dogs', 4),
  ('cat-yard',            'Yard / Outside', 5),
  ('cat-home-systems',    'Home Systems', 6),
  ('cat-admin',           'Admin / Household Ops', 7)
on conflict (id) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into chores (id, category_id, name, frequency, owner, done, sort_order) values
  ('chore-1',  'cat-weekly-cleaning', 'Declutter', 'Weekly', 'Meg', false, 0),
  ('chore-2',  'cat-weekly-cleaning', 'Clean surfaces / dust', 'Bi-Weekly', 'Leti', false, 1),
  ('chore-3',  'cat-weekly-cleaning', 'Sweep', 'Weekly', 'Meg', false, 2),
  ('chore-4',  'cat-weekly-cleaning', 'Mop (as needed)', 'As needed', 'Meg', false, 3),
  ('chore-5',  'cat-weekly-cleaning', 'Take out office trash', 'Weekly', 'Leti', false, 4),
  ('chore-6',  'cat-weekly-cleaning', 'Clean the living room rug', 'As needed', 'Meg', false, 5),
  ('chore-7',  'cat-laundry', 'Wash bed linens', 'Bi-Weekly', 'Leti', false, 6),
  ('chore-8',  'cat-laundry', 'Wash towels', 'Bi-Weekly', 'Leti', false, 7),
  ('chore-9',  'cat-laundry', 'Do laundry', 'Weekly', 'Meg', false, 8),
  ('chore-10', 'cat-laundry', 'Put laundry away', 'Weekly', 'Meg', false, 9),
  ('chore-11', 'cat-kitchen', 'Clean the kitchen (general)', 'Weekly', 'Meg', false, 10),
  ('chore-12', 'cat-kitchen', 'Wipe stovetop / oven interior', 'Weekly', 'Leti', false, 11),
  ('chore-13', 'cat-kitchen', 'Wipe cabinet fronts', 'Monthly', 'Meg', false, 12),
  ('chore-14', 'cat-kitchen', 'Clean the fridge inside', 'Monthly', 'Meg', false, 13),
  ('chore-15', 'cat-kitchen', 'Descale coffee maker or kettle', 'Monthly', 'Meg', false, 14),
  ('chore-16', 'cat-kitchen', 'Clean dishwasher filter', 'As needed', 'Meg', false, 15),
  ('chore-17', 'cat-bathrooms', 'Clean tub', 'Bi-Weekly', 'Leti', false, 16),
  ('chore-18', 'cat-bathrooms', 'Clean Shower', 'Bi-Weekly', 'Leti', false, 17),
  ('chore-19', 'cat-bathrooms', 'Clean bathroom (Sink, floor, Glass, Toilet)', 'Weekly', 'Leti', false, 18),
  ('chore-20', 'cat-dogs', 'Feed dogs', 'Daily', 'Leti', false, 19),
  ('chore-21', 'cat-dogs', 'Pick up poop in the backyard', 'Weekly', 'Leti', false, 20),
  ('chore-22', 'cat-dogs', 'Refill medications', 'Ongoing', 'Leti', false, 21),
  ('chore-23', 'cat-dogs', 'Wash dog beds and blankets', 'Monthly', 'Leti', false, 22),
  ('chore-24', 'cat-dogs', 'Replenish treats, supplies', 'As needed', 'Leti', false, 23),
  ('chore-25', 'cat-dogs', 'Schedule vet appointments', 'As needed', 'Meg', false, 24),
  ('chore-26', 'cat-yard', 'Rake / clear leaves', 'Seasonal', 'Meg', false, 25),
  ('chore-27', 'cat-yard', 'Take out weekly trash bins', 'Weekly', 'Meg', false, 26),
  ('chore-28', 'cat-yard', 'Put bins out on trash day', 'Weekly', 'Meg', false, 27),
  ('chore-29', 'cat-yard', 'Get mail', 'Daily', 'Meg', false, 28),
  ('chore-30', 'cat-yard', 'Bring in packages + put away', 'As needed', 'Both', false, 29),
  ('chore-31', 'cat-yard', 'Water garden / plants', 'As needed', 'Meg', false, 30),
  ('chore-32', 'cat-home-systems', 'Change air filters', 'Quarterly', 'Meg', false, 31),
  ('chore-33', 'cat-home-systems', 'Track and toss expired food', 'Weekly', 'Meg', false, 32),
  ('chore-34', 'cat-admin', 'Manage Amazon auto-deliveries', 'Ongoing', 'Meg', false, 33),
  ('chore-35', 'cat-admin', 'Restock household supplies (paper goods, cleaning, toiletries)', 'As needed', 'Meg', false, 34),
  ('chore-36', 'cat-admin', 'Meal planning', 'Weekly', 'Meg', false, 35),
  ('chore-37', 'cat-admin', 'Grocery shopping', 'Weekly', 'Meg', false, 36),
  ('chore-38', 'cat-admin', 'Pay bills', 'Monthly', 'Meg', false, 37),
  ('chore-39', 'cat-admin', 'Manage finances', 'Monthly', 'Meg', false, 38),
  ('chore-40', 'cat-admin', 'Manage subscriptions and renewals', 'As needed', 'Both', false, 39),
  ('chore-41', 'cat-admin', 'Coordinate home repairs / contractors', 'As needed', 'Both', false, 40)
on conflict (id) do nothing;
