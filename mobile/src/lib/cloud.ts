import { supabase } from './supabase'
import type { Completion, MemberName, Task } from '../types'
import { SEED_COMPLETIONS, SEED_TASKS } from '../data/seed'

interface TaskRow {
  id: string
  area_id: string
  name: string
  frequency: Task['frequency']
  owner: Task['owner']
  last_done_at: string | null
  note: string | null
  reminder_enabled: boolean
  reminder_time: string | null
  sort_order: number
}

interface CompRow {
  id: string
  task_id: string
  member: MemberName
  at: string
}

const fromTask = (r: TaskRow): Task => ({
  id: r.id,
  areaId: r.area_id,
  name: r.name,
  frequency: r.frequency,
  owner: r.owner,
  lastDoneAt: r.last_done_at,
  note: r.note,
  reminderEnabled: r.reminder_enabled ?? false,
  reminderTime: r.reminder_time ?? null,
  sortOrder: r.sort_order,
})

const toTask = (t: Task): TaskRow => ({
  id: t.id,
  area_id: t.areaId,
  name: t.name,
  frequency: t.frequency,
  owner: t.owner,
  last_done_at: t.lastDoneAt,
  note: t.note,
  reminder_enabled: t.reminderEnabled,
  reminder_time: t.reminderTime,
  sort_order: t.sortOrder,
})

const fromComp = (r: CompRow): Completion => ({
  id: r.id,
  taskId: r.task_id,
  member: r.member,
  at: r.at,
})

const toComp = (c: Completion): CompRow => ({
  id: c.id,
  task_id: c.taskId,
  member: c.member,
  at: c.at,
})

export async function fetchAll(): Promise<{ tasks: Task[]; completions: Completion[] }> {
  const db = supabase!
  const [t, c] = await Promise.all([
    db.from('tasks').select('*').order('sort_order', { ascending: true }),
    db.from('completions').select('*'),
  ])
  return {
    tasks: ((t.data as TaskRow[]) ?? []).map(fromTask),
    completions: ((c.data as CompRow[]) ?? []).map(fromComp),
  }
}

/** First-run seed: if the cloud is empty, populate it from the chore tracker. */
export async function seedIfEmpty(): Promise<boolean> {
  const db = supabase!
  const { count } = await db.from('tasks').select('id', { count: 'exact', head: true })
  if (count && count > 0) return false
  await db.from('tasks').insert(SEED_TASKS.map(toTask))
  if (SEED_COMPLETIONS.length) await db.from('completions').insert(SEED_COMPLETIONS.map(toComp))
  return true
}

export async function upsertTaskCloud(task: Task): Promise<void> {
  await supabase!.from('tasks').upsert(toTask(task))
}

export async function patchTaskCloud(id: string, fields: Partial<TaskRow>): Promise<void> {
  await supabase!.from('tasks').update(fields).eq('id', id)
}

export async function deleteTaskCloud(id: string): Promise<void> {
  await supabase!.from('tasks').delete().eq('id', id)
}

export async function addCompletionCloud(c: Completion): Promise<void> {
  await supabase!.from('completions').insert(toComp(c))
}

export async function deleteCompletionCloud(id: string): Promise<void> {
  await supabase!.from('completions').delete().eq('id', id)
}

/** Subscribe to live changes on tasks + completions; calls back on any change. */
export function subscribe(onChange: () => void) {
  const db = supabase!
  const channel = db
    .channel('halvsies-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'completions' }, onChange)
    .subscribe()
  return () => {
    void db.removeChannel(channel)
  }
}
