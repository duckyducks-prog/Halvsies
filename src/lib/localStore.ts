import type { Chore } from '../types'
import { SEED_CHORES } from '../data/seed'

const KEY = 'homebase.chores.v1'

/** Backfill fields added in later versions onto chores saved by an older build. */
function normalize(chore: Chore): Chore {
  return {
    ...chore,
    reminderEnabled: chore.reminderEnabled ?? false,
    reminderTime: chore.reminderTime ?? null,
  }
}

/** Load chores from localStorage, seeding from the Chore Tracker on first run. */
export function loadLocalChores(): Chore[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return (JSON.parse(raw) as Chore[]).map(normalize)
  } catch {
    // ignore malformed storage and re-seed
  }
  const seeded = SEED_CHORES.map((c) => ({ ...c }))
  saveLocalChores(seeded)
  return seeded
}

export function saveLocalChores(chores: Chore[]): void {
  localStorage.setItem(KEY, JSON.stringify(chores))
}
