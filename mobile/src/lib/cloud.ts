import { supabase } from './supabase'
import type { Completion, GroceryItem, MealEntry, MemberName, Recipe, Task } from '../types'
import { SEED_COMPLETIONS, SEED_RECIPES, SEED_TASKS } from '../data/seed'

// ---- row mappers ----------------------------------------------------------
interface TaskRow {
  id: string; area_id: string; name: string; frequency: Task['frequency']; owner: Task['owner']
  last_done_at: string | null; note: string | null; reminder_enabled: boolean
  reminder_time: string | null; sort_order: number
}
const fromTask = (r: TaskRow): Task => ({
  id: r.id, areaId: r.area_id, name: r.name, frequency: r.frequency, owner: r.owner,
  lastDoneAt: r.last_done_at, note: r.note, reminderEnabled: r.reminder_enabled ?? false,
  reminderTime: r.reminder_time ?? null, sortOrder: r.sort_order,
})
const toTask = (t: Task): TaskRow => ({
  id: t.id, area_id: t.areaId, name: t.name, frequency: t.frequency, owner: t.owner,
  last_done_at: t.lastDoneAt, note: t.note, reminder_enabled: t.reminderEnabled,
  reminder_time: t.reminderTime, sort_order: t.sortOrder,
})

interface CompRow { id: string; task_id: string; member: MemberName; at: string }
const fromComp = (r: CompRow): Completion => ({ id: r.id, taskId: r.task_id, member: r.member, at: r.at })
const toComp = (c: Completion): CompRow => ({ id: c.id, task_id: c.taskId, member: c.member, at: c.at })

interface GroceryRow {
  id: string; name: string; status: GroceryItem['status']; added_by: MemberName
  recipe_id: string | null; created_at: string
}
const fromGrocery = (r: GroceryRow): GroceryItem => ({
  id: r.id, name: r.name, status: r.status, addedBy: r.added_by, recipeId: r.recipe_id, createdAt: r.created_at,
})
const toGrocery = (g: GroceryItem): GroceryRow => ({
  id: g.id, name: g.name, status: g.status, added_by: g.addedBy, recipe_id: g.recipeId, created_at: g.createdAt,
})

interface RecipeRow { id: string; name: string; ingredients: Recipe['ingredients']; created_by: MemberName }
const fromRecipe = (r: RecipeRow): Recipe => ({ id: r.id, name: r.name, ingredients: r.ingredients ?? [], createdBy: r.created_by })
const toRecipe = (r: Recipe): RecipeRow => ({ id: r.id, name: r.name, ingredients: r.ingredients, created_by: r.createdBy })

interface MealRow { id: string; date: string; recipe_id: string; cook: MemberName | null; pushed_to_grocery: boolean }
const fromMeal = (r: MealRow): MealEntry => ({ id: r.id, date: r.date, recipeId: r.recipe_id, cook: r.cook, pushedToGrocery: r.pushed_to_grocery })
const toMeal = (m: MealEntry): MealRow => ({ id: m.id, date: m.date, recipe_id: m.recipeId, cook: m.cook, pushed_to_grocery: m.pushedToGrocery })

// ---- reads ----------------------------------------------------------------
export interface CloudData {
  tasks: Task[]; completions: Completion[]; grocery: GroceryItem[]; recipes: Recipe[]; meals: MealEntry[]
}

export async function fetchAll(): Promise<CloudData> {
  const db = supabase!
  const [t, c, g, r, m] = await Promise.all([
    db.from('tasks').select('*').order('sort_order', { ascending: true }),
    db.from('completions').select('*'),
    db.from('grocery_items').select('*').order('created_at', { ascending: true }),
    db.from('recipes').select('*'),
    db.from('meal_entries').select('*'),
  ])
  return {
    tasks: ((t.data as TaskRow[]) ?? []).map(fromTask),
    completions: ((c.data as CompRow[]) ?? []).map(fromComp),
    grocery: ((g.data as GroceryRow[]) ?? []).map(fromGrocery),
    recipes: ((r.data as RecipeRow[]) ?? []).map(fromRecipe),
    meals: ((m.data as MealRow[]) ?? []).map(fromMeal),
  }
}

/** First-run seed: populate empty tables from the chore tracker / starter recipes. */
export async function seedIfEmpty(): Promise<void> {
  const db = supabase!
  const tasks = await db.from('tasks').select('id', { count: 'exact', head: true })
  if (!tasks.count) {
    await db.from('tasks').insert(SEED_TASKS.map(toTask))
    if (SEED_COMPLETIONS.length) await db.from('completions').insert(SEED_COMPLETIONS.map(toComp))
  }
  const recipes = await db.from('recipes').select('id', { count: 'exact', head: true })
  if (!recipes.count) await db.from('recipes').insert(SEED_RECIPES.map(toRecipe))
}

// ---- writes ---------------------------------------------------------------
export const upsertTaskCloud = (task: Task) => supabase!.from('tasks').upsert(toTask(task)).then(() => {})
export const patchTaskCloud = (id: string, fields: Partial<TaskRow>) =>
  supabase!.from('tasks').update(fields).eq('id', id).then(() => {})
export const deleteTaskCloud = (id: string) => supabase!.from('tasks').delete().eq('id', id).then(() => {})
export const addCompletionCloud = (c: Completion) => supabase!.from('completions').insert(toComp(c)).then(() => {})
export const deleteCompletionCloud = (id: string) => supabase!.from('completions').delete().eq('id', id).then(() => {})

export const upsertGroceryCloud = (g: GroceryItem) => supabase!.from('grocery_items').upsert(toGrocery(g)).then(() => {})
export const insertGroceryManyCloud = (gs: GroceryItem[]) =>
  gs.length ? supabase!.from('grocery_items').insert(gs.map(toGrocery)).then(() => {}) : Promise.resolve()
export const patchGroceryCloud = (id: string, fields: Partial<GroceryRow>) =>
  supabase!.from('grocery_items').update(fields).eq('id', id).then(() => {})
export const deleteGroceryCloud = (id: string) => supabase!.from('grocery_items').delete().eq('id', id).then(() => {})

export const upsertRecipeCloud = (r: Recipe) => supabase!.from('recipes').upsert(toRecipe(r)).then(() => {})
export const deleteRecipeCloud = (id: string) => supabase!.from('recipes').delete().eq('id', id).then(() => {})

export const upsertMealCloud = (m: MealEntry) => supabase!.from('meal_entries').upsert(toMeal(m)).then(() => {})
export const deleteMealCloud = (id: string) => supabase!.from('meal_entries').delete().eq('id', id).then(() => {})

/** Subscribe to live changes across all Halvsies tables. */
export function subscribe(onChange: () => void) {
  const db = supabase!
  const tables = ['tasks', 'completions', 'grocery_items', 'recipes', 'meal_entries']
  let channel = db.channel('halvsies-sync')
  for (const table of tables) {
    channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, onChange)
  }
  channel.subscribe()
  return () => {
    void db.removeChannel(channel)
  }
}
