import { useCallback, useEffect, useRef, useState } from 'react'
import type { Chore } from '../types'
import { supabase, isCloudEnabled } from '../lib/supabase'
import { loadLocalChores, saveLocalChores } from '../lib/localStore'

interface ChoreRow {
  id: string
  category_id: string
  name: string
  frequency: Chore['frequency']
  owner: Chore['owner']
  done: boolean
  last_done_at: string | null
  sort_order: number
  reminder_enabled: boolean
  reminder_time: string | null
}

const fromRow = (r: ChoreRow): Chore => ({
  id: r.id,
  categoryId: r.category_id,
  name: r.name,
  frequency: r.frequency,
  owner: r.owner,
  done: r.done,
  lastDoneAt: r.last_done_at,
  sortOrder: r.sort_order,
  reminderEnabled: r.reminder_enabled ?? false,
  reminderTime: r.reminder_time ?? null,
})

const toRow = (c: Chore): ChoreRow => ({
  id: c.id,
  category_id: c.categoryId,
  name: c.name,
  frequency: c.frequency,
  owner: c.owner,
  done: c.done,
  last_done_at: c.lastDoneAt,
  sort_order: c.sortOrder,
  reminder_enabled: c.reminderEnabled,
  reminder_time: c.reminderTime,
})

export interface UseChores {
  chores: Chore[]
  loading: boolean
  error: string | null
  toggleDone: (chore: Chore) => void
  toggleReminder: (chore: Chore) => void
  upsertChore: (chore: Chore) => void
  deleteChore: (id: string) => void
}

/**
 * Single source of truth for chores. Uses Supabase (with live Realtime sync)
 * when configured; otherwise a seeded localStorage store so the app runs offline.
 */
export function useChores(): UseChores {
  const [chores, setChores] = useState<Chore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const choresRef = useRef<Chore[]>([])

  // Keep a ref in sync so persistence helpers can read latest without re-subscribing.
  const setBoth = useCallback((next: Chore[]) => {
    choresRef.current = next
    setChores(next)
  }, [])

  // Initial load + (cloud) realtime subscription.
  useEffect(() => {
    let active = true

    if (!isCloudEnabled || !supabase) {
      setBoth(loadLocalChores())
      setLoading(false)
      return
    }

    supabase
      .from('chores')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data, error: err }) => {
        if (!active) return
        if (err) setError(err.message)
        else setBoth((data as ChoreRow[]).map(fromRow))
        setLoading(false)
      })

    const channel = supabase
      .channel('chores-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chores' }, () => {
        supabase!
          .from('chores')
          .select('*')
          .order('sort_order', { ascending: true })
          .then(({ data }) => {
            if (active && data) setBoth((data as ChoreRow[]).map(fromRow))
          })
      })
      .subscribe()

    return () => {
      active = false
      supabase!.removeChannel(channel)
    }
  }, [setBoth])

  const persistLocal = useCallback((next: Chore[]) => {
    setBoth(next)
    saveLocalChores(next)
  }, [setBoth])

  const toggleDone = useCallback(
    (chore: Chore) => {
      const done = !chore.done
      const updated: Chore = {
        ...chore,
        done,
        lastDoneAt: done ? new Date().toISOString() : null,
      }
      // optimistic update
      const next = choresRef.current.map((c) => (c.id === chore.id ? updated : c))
      if (isCloudEnabled && supabase) {
        setBoth(next)
        supabase.from('chores').update(toRow(updated)).eq('id', chore.id).then(({ error: err }) => {
          if (err) setError(err.message)
        })
      } else {
        persistLocal(next)
      }
    },
    [persistLocal, setBoth],
  )

  const toggleReminder = useCallback(
    (chore: Chore) => {
      const updated: Chore = { ...chore, reminderEnabled: !chore.reminderEnabled }
      const next = choresRef.current.map((c) => (c.id === chore.id ? updated : c))
      if (isCloudEnabled && supabase) {
        setBoth(next)
        supabase.from('chores').update(toRow(updated)).eq('id', chore.id).then(({ error: err }) => {
          if (err) setError(err.message)
        })
      } else {
        persistLocal(next)
      }
    },
    [persistLocal, setBoth],
  )

  const upsertChore = useCallback(
    (chore: Chore) => {
      const exists = choresRef.current.some((c) => c.id === chore.id)
      const next = exists
        ? choresRef.current.map((c) => (c.id === chore.id ? chore : c))
        : [...choresRef.current, chore]
      if (isCloudEnabled && supabase) {
        setBoth(next)
        supabase.from('chores').upsert(toRow(chore)).then(({ error: err }) => {
          if (err) setError(err.message)
        })
      } else {
        persistLocal(next)
      }
    },
    [persistLocal, setBoth],
  )

  const deleteChore = useCallback(
    (id: string) => {
      const next = choresRef.current.filter((c) => c.id !== id)
      if (isCloudEnabled && supabase) {
        setBoth(next)
        supabase.from('chores').delete().eq('id', id).then(({ error: err }) => {
          if (err) setError(err.message)
        })
      } else {
        persistLocal(next)
      }
    },
    [persistLocal, setBoth],
  )

  return { chores, loading, error, toggleDone, toggleReminder, upsertChore, deleteChore }
}
