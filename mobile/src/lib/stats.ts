import type { Completion, Task } from '../types'
import { isCheckedOff, isDue } from './frequency'

export function isSameDay(iso: string, now = new Date()): boolean {
  const d = new Date(iso)
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export function startOfWeek(now = new Date()): Date {
  const diff = (now.getDay() + 6) % 7 // days since Monday
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff)
  return d
}

export function completedToday(taskId: string, completions: Completion[], now = new Date()): boolean {
  return completions.some((c) => c.taskId === taskId && isSameDay(c.at, now))
}

export function weekCounts(
  completions: Completion[],
  now = new Date(),
): { Meg: number; Leti: number } {
  const start = startOfWeek(now).getTime()
  const out = { Meg: 0, Leti: 0 }
  for (const c of completions) {
    if (new Date(c.at).getTime() >= start) out[c.member]++
  }
  return out
}

/** Tasks relevant to "Today": currently due, or already completed today. */
export function todaysTasks(tasks: Task[], completions: Completion[], now = new Date()): Task[] {
  return tasks.filter((t) => isDue(t, now) || completedToday(t.id, completions, now))
}

/** done / total for the Today progress ring over a set of tasks. */
export function progressOf(tasks: Task[], now = new Date()): { done: number; total: number } {
  const done = tasks.filter((t) => isCheckedOff(t, now)).length
  return { done, total: tasks.length }
}
