import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Completion, GroceryItem, MealEntry, Recipe, Task } from '../types'
import { SEED_COMPLETIONS, SEED_RECIPES, SEED_TASKS } from '../data/seed'

const KEYS = {
  tasks: 'halvsies.tasks.v1',
  completions: 'halvsies.completions.v1',
  grocery: 'halvsies.grocery.v1',
  recipes: 'halvsies.recipes.v1',
  meals: 'halvsies.meals.v1',
}

export interface LocalData {
  tasks: Task[]
  completions: Completion[]
  grocery: GroceryItem[]
  recipes: Recipe[]
  meals: MealEntry[]
}

const parse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export async function loadLocal(): Promise<LocalData> {
  const [t, c, g, r, m] = await Promise.all([
    AsyncStorage.getItem(KEYS.tasks),
    AsyncStorage.getItem(KEYS.completions),
    AsyncStorage.getItem(KEYS.grocery),
    AsyncStorage.getItem(KEYS.recipes),
    AsyncStorage.getItem(KEYS.meals),
  ])
  if (t) {
    return {
      tasks: parse(t, [] as Task[]),
      completions: parse(c, [] as Completion[]),
      grocery: parse(g, [] as GroceryItem[]),
      recipes: parse(r, SEED_RECIPES),
      meals: parse(m, [] as MealEntry[]),
    }
  }
  const seeded: LocalData = {
    tasks: SEED_TASKS.map((x) => ({ ...x })),
    completions: SEED_COMPLETIONS.map((x) => ({ ...x })),
    grocery: [],
    recipes: SEED_RECIPES.map((x) => ({ ...x })),
    meals: [],
  }
  await saveLocal(seeded)
  return seeded
}

export async function saveLocal(data: LocalData): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(KEYS.tasks, JSON.stringify(data.tasks)),
    AsyncStorage.setItem(KEYS.completions, JSON.stringify(data.completions)),
    AsyncStorage.setItem(KEYS.grocery, JSON.stringify(data.grocery)),
    AsyncStorage.setItem(KEYS.recipes, JSON.stringify(data.recipes)),
    AsyncStorage.setItem(KEYS.meals, JSON.stringify(data.meals)),
  ])
}
