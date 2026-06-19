import type { Task, Frequency } from '../types'

// Frequencies that auto-reset on a fixed calendar boundary. Others
// (Seasonal / As needed / Ongoing) are manual: done until you uncheck.
const RECURRING: Frequency[] = ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly']

const DAY_MS = 24 * 60 * 60 * 1000
// A known Monday (2024-01-01 was a Monday) anchors Bi-Weekly parity.
const MONDAY_EPOCH = new Date(2024, 0, 1).getTime()

export function isRecurring(frequency: Frequency): boolean {
  return RECURRING.includes(frequency)
}

function startOfDay(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function mondayOfWeek(now: Date): Date {
  const d = startOfDay(now)
  const diff = (d.getDay() + 6) % 7 // days since Monday
  d.setDate(d.getDate() - diff)
  return d
}

/** Start of the task's current period, or null for manual frequencies. */
export function periodStart(frequency: Frequency, now: Date = new Date()): Date | null {
  switch (frequency) {
    case 'Daily':
      return startOfDay(now)
    case 'Weekly':
      return mondayOfWeek(now)
    case 'Bi-Weekly': {
      const monday = mondayOfWeek(now)
      const weeks = Math.floor((monday.getTime() - MONDAY_EPOCH) / (7 * DAY_MS))
      // If this week is the 2nd of its 2-week block, step back one week.
      return weeks % 2 === 0 ? monday : new Date(monday.getTime() - 7 * DAY_MS)
    }
    case 'Monthly':
      return new Date(now.getFullYear(), now.getMonth(), 1)
    case 'Quarterly':
      return new Date(now.getFullYear(), now.getMonth() - (now.getMonth() % 3), 1)
    default:
      return null // Seasonal / As needed / Ongoing → manual
  }
}

/** Done for the current period? Recurring: completed since the period start.
 *  Manual: done until explicitly unchecked (any completion counts). */
export function isCheckedOff(task: Task, now: Date = new Date()): boolean {
  if (!task.lastDoneAt) return false
  const start = periodStart(task.frequency, now)
  if (!start) return true // manual + has a completion → stays done
  return new Date(task.lastDoneAt).getTime() >= start.getTime()
}

/** Needs doing now: a recurring task not yet completed this period. */
export function isDue(task: Task, now: Date = new Date()): boolean {
  return isRecurring(task.frequency) && !isCheckedOff(task, now)
}

/** When the task next resets (becomes to-do again), or null for manual. */
export function nextReset(frequency: Frequency, now: Date = new Date()): Date | null {
  const start = periodStart(frequency, now)
  if (!start) return null
  switch (frequency) {
    case 'Daily':
      return new Date(start.getTime() + DAY_MS)
    case 'Weekly':
      return new Date(start.getTime() + 7 * DAY_MS)
    case 'Bi-Weekly':
      return new Date(start.getTime() + 14 * DAY_MS)
    case 'Monthly':
      return new Date(start.getFullYear(), start.getMonth() + 1, 1)
    case 'Quarterly':
      return new Date(start.getFullYear(), start.getMonth() + 3, 1)
    default:
      return null
  }
}

/** Short label for the detail "Next due" row. */
export function nextResetLabel(task: Task, now: Date = new Date()): string {
  const next = nextReset(task.frequency, now)
  if (!next) return '—'
  return next.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}
