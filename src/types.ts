// Shared domain types for Homebase.

export type Owner = 'Meg' | 'Leti' | 'Both'

export type Frequency =
  | 'Daily'
  | 'Weekly'
  | 'Bi-Weekly'
  | 'Monthly'
  | 'Quarterly'
  | 'Seasonal'
  | 'As needed'
  | 'Ongoing'

export type MemberName = 'Meg' | 'Leti'

export interface Member {
  name: MemberName
  color: string
}

export interface ChoreCategory {
  id: string
  name: string
  sortOrder: number
}

export interface Chore {
  id: string
  categoryId: string
  name: string
  frequency: Frequency
  owner: Owner
  done: boolean
  /** ISO timestamp of when it was last marked done, or null if never. */
  lastDoneAt: string | null
  sortOrder: number
}
