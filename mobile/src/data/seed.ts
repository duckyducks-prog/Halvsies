import type { Area, Completion, Frequency, Member, Owner, Task } from '../types'

export const SEED_MEMBERS: Member[] = [
  { name: 'Meg', color: '#B0744A' }, // clay
  { name: 'Leti', color: '#558379' }, // sage
]

export const SEED_AREAS: Area[] = [
  { id: 'area-weekly-cleaning', name: 'Weekly Cleaning', sortOrder: 0 },
  { id: 'area-laundry', name: 'Laundry', sortOrder: 1 },
  { id: 'area-kitchen', name: 'Kitchen', sortOrder: 2 },
  { id: 'area-bathrooms', name: 'Bathrooms', sortOrder: 3 },
  { id: 'area-dogs', name: 'Dogs', sortOrder: 4 },
  { id: 'area-yard', name: 'Yard / Outside', sortOrder: 5 },
  { id: 'area-home-systems', name: 'Home Systems', sortOrder: 6 },
  { id: 'area-admin', name: 'Admin / Household Ops', sortOrder: 7 },
]

// [areaId, name, frequency, owner] — from the household chore tracker.
const RAW: Array<[string, string, Frequency, Owner]> = [
  ['area-weekly-cleaning', 'Declutter', 'Weekly', 'Meg'],
  ['area-weekly-cleaning', 'Clean surfaces / dust', 'Bi-Weekly', 'Leti'],
  ['area-weekly-cleaning', 'Sweep', 'Weekly', 'Meg'],
  ['area-weekly-cleaning', 'Mop', 'As needed', 'Meg'],
  ['area-weekly-cleaning', 'Take out office trash', 'Weekly', 'Leti'],
  ['area-weekly-cleaning', 'Clean the living room rug', 'As needed', 'Meg'],

  ['area-laundry', 'Wash bed linens', 'Bi-Weekly', 'Leti'],
  ['area-laundry', 'Wash towels', 'Bi-Weekly', 'Leti'],
  ['area-laundry', 'Do laundry', 'Weekly', 'Meg'],
  ['area-laundry', 'Put laundry away', 'Weekly', 'Meg'],

  ['area-kitchen', 'Clean the kitchen', 'Weekly', 'Meg'],
  ['area-kitchen', 'Wipe stovetop / oven interior', 'Weekly', 'Leti'],
  ['area-kitchen', 'Wipe cabinet fronts', 'Monthly', 'Meg'],
  ['area-kitchen', 'Clean the fridge inside', 'Monthly', 'Meg'],
  ['area-kitchen', 'Descale coffee maker or kettle', 'Monthly', 'Meg'],
  ['area-kitchen', 'Clean dishwasher filter', 'As needed', 'Meg'],

  ['area-bathrooms', 'Clean tub', 'Bi-Weekly', 'Leti'],
  ['area-bathrooms', 'Clean shower', 'Bi-Weekly', 'Leti'],
  ['area-bathrooms', 'Clean bathroom (sink, floor, glass, toilet)', 'Weekly', 'Leti'],

  ['area-dogs', 'Feed dogs', 'Daily', 'Leti'],
  ['area-dogs', 'Pick up poop in the backyard', 'Weekly', 'Leti'],
  ['area-dogs', 'Refill medications', 'Ongoing', 'Leti'],
  ['area-dogs', 'Wash dog beds and blankets', 'Monthly', 'Leti'],
  ['area-dogs', 'Replenish treats, supplies', 'As needed', 'Leti'],
  ['area-dogs', 'Schedule vet appointments', 'As needed', 'Meg'],

  ['area-yard', 'Rake / clear leaves', 'Seasonal', 'Meg'],
  ['area-yard', 'Take out weekly trash bins', 'Weekly', 'Meg'],
  ['area-yard', 'Put bins out on trash day', 'Weekly', 'Meg'],
  ['area-yard', 'Get mail', 'Daily', 'Meg'],
  ['area-yard', 'Bring in packages + put away', 'As needed', 'Both'],
  ['area-yard', 'Water garden / plants', 'As needed', 'Meg'],

  ['area-home-systems', 'Change air filters', 'Quarterly', 'Meg'],
  ['area-home-systems', 'Track and toss expired food', 'Weekly', 'Meg'],

  ['area-admin', 'Manage Amazon auto-deliveries', 'Ongoing', 'Meg'],
  ['area-admin', 'Restock household supplies', 'As needed', 'Meg'],
  ['area-admin', 'Meal planning', 'Weekly', 'Meg'],
  ['area-admin', 'Grocery shopping', 'Weekly', 'Meg'],
  ['area-admin', 'Pay bills', 'Monthly', 'Meg'],
  ['area-admin', 'Manage finances', 'Monthly', 'Meg'],
  ['area-admin', 'Manage subscriptions and renewals', 'As needed', 'Both'],
  ['area-admin', 'Coordinate home repairs / contractors', 'As needed', 'Both'],
]

export const SEED_TASKS: Task[] = RAW.map(([areaId, name, frequency, owner], i) => ({
  id: `task-${i + 1}`,
  areaId,
  name,
  frequency,
  owner,
  lastDoneAt: null,
  note: null,
  reminderEnabled: false,
  reminderTime: null,
  sortOrder: i,
}))

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString()

// A few completions this week so Today's ring + the Balance split aren't empty on first run.
export const SEED_COMPLETIONS: Completion[] = [
  { id: 'seed-c1', taskId: 'task-20', member: 'Leti', at: hoursAgo(3) }, // Feed dogs
  { id: 'seed-c2', taskId: 'task-9', member: 'Meg', at: hoursAgo(5) }, // Do laundry
  { id: 'seed-c3', taskId: 'task-29', member: 'Meg', at: hoursAgo(28) }, // Get mail
  { id: 'seed-c4', taskId: 'task-19', member: 'Leti', at: hoursAgo(52) }, // Clean bathroom
  { id: 'seed-c5', taskId: 'task-3', member: 'Meg', at: hoursAgo(76) }, // Sweep
]

// Reflect the seed completions onto lastDoneAt so due-logic agrees on first run.
for (const c of SEED_COMPLETIONS) {
  const t = SEED_TASKS.find((x) => x.id === c.taskId)
  if (t && (!t.lastDoneAt || t.lastDoneAt < c.at)) t.lastDoneAt = c.at
}
