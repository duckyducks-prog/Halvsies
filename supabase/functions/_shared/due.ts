// Mirror of src/lib/frequency.ts due-logic, for server-side reminder evaluation.

export interface ChoreRow {
  id: string
  name: string
  frequency: string
  owner: string
  done: boolean
  last_done_at: string | null
  reminder_enabled: boolean
  reminder_time: string | null
  last_reminded_at: string | null
}

const INTERVAL_DAYS: Record<string, number> = {
  Daily: 1,
  Weekly: 7,
  'Bi-Weekly': 14,
  Monthly: 30,
  Quarterly: 91,
}
const DAY_MS = 24 * 60 * 60 * 1000

export function isRecurring(frequency: string): boolean {
  return frequency in INTERVAL_DAYS
}

/** When the chore next becomes due, or null if it doesn't auto-recur. */
export function nextDue(c: ChoreRow): Date | null {
  const interval = INTERVAL_DAYS[c.frequency]
  if (interval === undefined) return null
  if (!c.last_done_at) return new Date(0) // never done -> due now
  return new Date(new Date(c.last_done_at).getTime() + interval * DAY_MS)
}

export function isDue(c: ChoreRow, now: Date = new Date()): boolean {
  if (!isRecurring(c.frequency)) return !c.done
  const due = nextDue(c)
  return due !== null && now.getTime() >= due.getTime()
}

/** Whether a reminder should fire now: due, and not already reminded this cycle. */
export function shouldRemind(c: ChoreRow, now: Date = new Date()): boolean {
  if (!c.reminder_enabled || !isDue(c, now)) return false
  if (!c.last_reminded_at) return true // never reminded
  const due = nextDue(c)
  // Recurring: re-arm once a new due period begins (past completions move `due` forward).
  return due !== null && new Date(c.last_reminded_at) < due
}
