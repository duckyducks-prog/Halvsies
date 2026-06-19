import type { Task, Frequency } from '../types'

// Days after completion before a time-based task is "due" again.
// Frequencies not in this map (As needed / Ongoing / Seasonal) never auto-flag.
const INTERVAL_DAYS: Partial<Record<Frequency, number>> = {
  Daily: 1,
  Weekly: 7,
  'Bi-Weekly': 14,
  Monthly: 30,
  Quarterly: 91,
}

const DAY_MS = 24 * 60 * 60 * 1000

export function isRecurring(frequency: Frequency): boolean {
  return frequency in INTERVAL_DAYS
}

export function nextDue(task: Task): Date | null {
  const interval = INTERVAL_DAYS[task.frequency]
  if (interval === undefined) return null
  if (!task.lastDoneAt) return new Date(0) // never done -> due now
  return new Date(new Date(task.lastDoneAt).getTime() + interval * DAY_MS)
}

/** Whether a task currently needs doing. */
export function isDue(task: Task, now: Date = new Date()): boolean {
  if (!isRecurring(task.frequency)) {
    // Non-recurring: "due" until completed within the last day.
    if (!task.lastDoneAt) return true
    return now.getTime() - new Date(task.lastDoneAt).getTime() > DAY_MS
  }
  const due = nextDue(task)
  return due !== null && now.getTime() >= due.getTime()
}

export function dueLabel(task: Task, now: Date = new Date()): string {
  if (!isRecurring(task.frequency)) return isDue(task, now) ? 'To do' : 'Done'
  const due = nextDue(task)
  if (!due || !task.lastDoneAt) return 'Due now'
  const diffDays = Math.round((due.getTime() - now.getTime()) / DAY_MS)
  if (diffDays < 0) return `Overdue ${Math.abs(diffDays)}d`
  if (diffDays === 0) return 'Due today'
  return `Due in ${diffDays}d`
}

/** Has this task been completed within its current period (i.e. not due)? */
export function isCheckedOff(task: Task, now: Date = new Date()): boolean {
  return !isDue(task, now)
}
