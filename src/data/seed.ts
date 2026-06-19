import type { Chore, ChoreCategory, Frequency, Member, Owner } from '../types'

// The two household members. Colors drive the owner badges.
export const SEED_MEMBERS: Member[] = [
  { name: 'Meg', color: '#0ea5e9' },
  { name: 'Leti', color: '#e11d48' },
]

// Categories, in the order they appear in the original Chore Tracker sheet.
export const SEED_CATEGORIES: ChoreCategory[] = [
  { id: 'cat-weekly-cleaning', name: 'Weekly Cleaning', sortOrder: 0 },
  { id: 'cat-laundry', name: 'Laundry', sortOrder: 1 },
  { id: 'cat-kitchen', name: 'Kitchen', sortOrder: 2 },
  { id: 'cat-bathrooms', name: 'Bathrooms (2)', sortOrder: 3 },
  { id: 'cat-dogs', name: 'Dogs', sortOrder: 4 },
  { id: 'cat-yard', name: 'Yard / Outside', sortOrder: 5 },
  { id: 'cat-home-systems', name: 'Home Systems', sortOrder: 6 },
  { id: 'cat-admin', name: 'Admin / Household Ops', sortOrder: 7 },
]

// Raw chore rows from the sheet: [categoryId, name, frequency, owner].
const RAW: Array<[string, string, Frequency, Owner]> = [
  ['cat-weekly-cleaning', 'Declutter', 'Weekly', 'Meg'],
  ['cat-weekly-cleaning', 'Clean surfaces / dust', 'Bi-Weekly', 'Leti'],
  ['cat-weekly-cleaning', 'Sweep', 'Weekly', 'Meg'],
  ['cat-weekly-cleaning', 'Mop (as needed)', 'As needed', 'Meg'],
  ['cat-weekly-cleaning', 'Take out office trash', 'Weekly', 'Leti'],
  ['cat-weekly-cleaning', 'Clean the living room rug', 'As needed', 'Meg'],

  ['cat-laundry', 'Wash bed linens', 'Bi-Weekly', 'Leti'],
  ['cat-laundry', 'Wash towels', 'Bi-Weekly', 'Leti'],
  ['cat-laundry', 'Do laundry', 'Weekly', 'Meg'],
  ['cat-laundry', 'Put laundry away', 'Weekly', 'Meg'],

  ['cat-kitchen', 'Clean the kitchen (general)', 'Weekly', 'Meg'],
  ['cat-kitchen', 'Wipe stovetop / oven interior', 'Weekly', 'Leti'],
  ['cat-kitchen', 'Wipe cabinet fronts', 'Monthly', 'Meg'],
  ['cat-kitchen', 'Clean the fridge inside', 'Monthly', 'Meg'],
  ['cat-kitchen', 'Descale coffee maker or kettle', 'Monthly', 'Meg'],
  ['cat-kitchen', 'Clean dishwasher filter', 'As needed', 'Meg'],

  ['cat-bathrooms', 'Clean tub', 'Bi-Weekly', 'Leti'],
  ['cat-bathrooms', 'Clean Shower', 'Bi-Weekly', 'Leti'],
  ['cat-bathrooms', 'Clean bathroom (Sink, floor, Glass, Toilet)', 'Weekly', 'Leti'],

  ['cat-dogs', 'Feed dogs', 'Daily', 'Leti'],
  ['cat-dogs', 'Pick up poop in the backyard', 'Weekly', 'Leti'],
  ['cat-dogs', 'Refill medications', 'Ongoing', 'Leti'],
  ['cat-dogs', 'Wash dog beds and blankets', 'Monthly', 'Leti'],
  ['cat-dogs', 'Replenish treats, supplies', 'As needed', 'Leti'],
  ['cat-dogs', 'Schedule vet appointments', 'As needed', 'Meg'],

  ['cat-yard', 'Rake / clear leaves', 'Seasonal', 'Meg'],
  ['cat-yard', 'Take out weekly trash bins', 'Weekly', 'Meg'],
  ['cat-yard', 'Put bins out on trash day', 'Weekly', 'Meg'],
  ['cat-yard', 'Get mail', 'Daily', 'Meg'],
  ['cat-yard', 'Bring in packages + put away', 'As needed', 'Both'],
  ['cat-yard', 'Water garden / plants', 'As needed', 'Meg'],

  ['cat-home-systems', 'Change air filters', 'Quarterly', 'Meg'],
  ['cat-home-systems', 'Track and toss expired food', 'Weekly', 'Meg'],

  ['cat-admin', 'Manage Amazon auto-deliveries', 'Ongoing', 'Meg'],
  ['cat-admin', 'Restock household supplies (paper goods, cleaning, toiletries)', 'As needed', 'Meg'],
  ['cat-admin', 'Meal planning', 'Weekly', 'Meg'],
  ['cat-admin', 'Grocery shopping', 'Weekly', 'Meg'],
  ['cat-admin', 'Pay bills', 'Monthly', 'Meg'],
  ['cat-admin', 'Manage finances', 'Monthly', 'Meg'],
  ['cat-admin', 'Manage subscriptions and renewals', 'As needed', 'Both'],
  ['cat-admin', 'Coordinate home repairs / contractors', 'As needed', 'Both'],
]

export const SEED_CHORES: Chore[] = RAW.map(([categoryId, name, frequency, owner], i) => ({
  id: `chore-${i + 1}`,
  categoryId,
  name,
  frequency,
  owner,
  done: false,
  lastDoneAt: null,
  sortOrder: i,
}))
