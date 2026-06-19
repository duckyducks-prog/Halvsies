// Halvsies domain types (lifted from the web repo, extended for completions + notes).

export type Owner = 'Meg' | 'Leti' | 'Both'
export type MemberName = 'Meg' | 'Leti'

export type Frequency =
  | 'Daily'
  | 'Weekly'
  | 'Bi-Weekly'
  | 'Monthly'
  | 'Quarterly'
  | 'Seasonal'
  | 'As needed'
  | 'Ongoing'

export interface Member {
  name: MemberName
  color: string
}

/** A task area (matches the chore-tracker areas). */
export interface Area {
  id: string
  name: string
  sortOrder: number
}

export interface Task {
  id: string
  areaId: string
  name: string
  frequency: Frequency
  owner: Owner
  /** ISO timestamp of the most recent completion, or null if never done. */
  lastDoneAt: string | null
  note: string | null
  reminderEnabled: boolean
  reminderTime: string | null
  sortOrder: number
}

/** A completion event — drives Today progress and the Balance split. */
export interface Completion {
  id: string
  taskId: string
  member: MemberName
  at: string // ISO
}

export interface Ingredient {
  name: string
  qty?: string
}

export interface GroceryItem {
  id: string
  name: string
  status: 'toBuy' | 'inCart'
  addedBy: MemberName
  recipeId: string | null
  createdAt: string
}

export interface Recipe {
  id: string
  name: string
  ingredients: Ingredient[]
  createdBy: MemberName
}

export interface MealEntry {
  id: string
  date: string // YYYY-MM-DD
  recipeId: string
  cook: MemberName | null
  pushedToGrocery: boolean
}

export interface Insight {
  weekStart: string
  observation: string
  splitPct: { Meg: number; Leti: number }
  suggestions: { label: string; actionType: string }[]
  createdAt: string
}
