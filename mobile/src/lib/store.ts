import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Completion, Task } from '../types'
import { SEED_COMPLETIONS, SEED_TASKS } from '../data/seed'

const TASKS_KEY = 'halvsies.tasks.v1'
const COMPLETIONS_KEY = 'halvsies.completions.v1'

export interface LocalData {
  tasks: Task[]
  completions: Completion[]
}

export async function loadLocal(): Promise<LocalData> {
  try {
    const [t, c] = await Promise.all([
      AsyncStorage.getItem(TASKS_KEY),
      AsyncStorage.getItem(COMPLETIONS_KEY),
    ])
    if (t) {
      return {
        tasks: JSON.parse(t) as Task[],
        completions: c ? (JSON.parse(c) as Completion[]) : [],
      }
    }
  } catch {
    // fall through to seed
  }
  const seeded: LocalData = {
    tasks: SEED_TASKS.map((x) => ({ ...x })),
    completions: SEED_COMPLETIONS.map((x) => ({ ...x })),
  }
  await saveLocal(seeded)
  return seeded
}

export async function saveLocal(data: LocalData): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(TASKS_KEY, JSON.stringify(data.tasks)),
    AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(data.completions)),
  ])
}
