import type { Chore, Frequency } from '../types'

// Number of days after completion before a time-based chore is "due" again.
// Frequencies not in this map (As needed / Ongoing / Seasonal) never auto-flag.
const INTERVAL_DAYS: Partial<Record<Frequency, number>> = {
  Daily: 1,
  Weekly: 7,
  'Bi-Weekly': 14,
  Monthly: 30,
  Quarterly: 91,
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Frequencies that recur on a clock and can therefore be "due". */
export function isRecurring(frequency: Frequency): boolean {
  return frequency in INTERVAL_DAYS
}

/** When the chore next becomes due, or null if it doesn't auto-recur. */
export function nextDue(chore: Chore): Date | null {
  const interval = INTERVAL_DAYS[chore.frequency]
  if (interval === undefined) return null
  if (!chore.lastDoneAt) return new Date(0) // never done -> due now
  return new Date(new Date(chore.lastDoneAt).getTime() + interval * DAY_MS)
}

/**
 * Whether a chore should be surfaced as needing attention right now.
 * - Recurring chores: due when never done, or the interval since last done has elapsed.
 * - Non-recurring chores (As needed / Ongoing / Seasonal): due only while not marked done.
 */
export function isDue(chore: Chore, now: Date = new Date()): boolean {
  if (!isRecurring(chore.frequency)) return !chore.done
  const due = nextDue(chore)
  return due !== null && now.getTime() >= due.getTime()
}

/** Short human label for how overdue / fresh a chore is. */
export function dueLabel(chore: Chore, now: Date = new Date()): string {
  if (!isRecurring(chore.frequency)) return chore.done ? 'Done' : 'To do'
  const due = nextDue(chore)
  if (!due || !chore.lastDoneAt) return 'Due now'
  const diffDays = Math.round((due.getTime() - now.getTime()) / DAY_MS)
  if (diffDays < 0) return `Overdue ${Math.abs(diffDays)}d`
  if (diffDays === 0) return 'Due today'
  return `Due in ${diffDays}d`
}
