import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Completion, MemberName, Task } from '../types'
import { SEED_AREAS, SEED_MEMBERS } from '../data/seed'
import { loadLocal, saveLocal } from '../lib/store'
import { getCurrentMember, loadCurrentMember, setCurrentMember } from '../lib/identity'

interface DataContextValue {
  loading: boolean
  tasks: Task[]
  completions: Completion[]
  areas: typeof SEED_AREAS
  members: typeof SEED_MEMBERS
  currentMember: MemberName
  setMember: (m: MemberName) => void
  completeTask: (task: Task) => void
  uncompleteTask: (task: Task) => void
  upsertTask: (task: Task) => void
  deleteTask: (id: string) => void
  toggleReminder: (task: Task) => void
  taskById: (id: string) => Task | undefined
}

const DataContext = createContext<DataContextValue | null>(null)

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export function DataProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [currentMember, setCurrentMemberState] = useState<MemberName>(getCurrentMember())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([loadLocal(), loadCurrentMember()]).then(([data, me]) => {
      if (!active) return
      setTasks(data.tasks)
      setCompletions(data.completions)
      setCurrentMemberState(me)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  // Persist whenever data changes (after initial load).
  useEffect(() => {
    if (!loading) saveLocal({ tasks, completions })
  }, [tasks, completions, loading])

  const completeTask = useCallback(
    (task: Task) => {
      const now = new Date().toISOString()
      setCompletions((cs) => [
        ...cs,
        { id: uid(), taskId: task.id, member: getCurrentMember(), at: now },
      ])
      setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, lastDoneAt: now } : t)))
    },
    [],
  )

  const uncompleteTask = useCallback((task: Task) => {
    setCompletions((cs) => {
      // remove this task's most recent completion
      let latestIdx = -1
      let latestAt = ''
      cs.forEach((c, i) => {
        if (c.taskId === task.id && c.at > latestAt) {
          latestAt = c.at
          latestIdx = i
        }
      })
      const next = latestIdx >= 0 ? cs.filter((_, i) => i !== latestIdx) : cs
      // recompute lastDoneAt from remaining completions
      const remaining = next.filter((c) => c.taskId === task.id).map((c) => c.at).sort()
      const newLast = remaining.length ? remaining[remaining.length - 1] : null
      setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, lastDoneAt: newLast } : t)))
      return next
    })
  }, [])

  const upsertTask = useCallback((task: Task) => {
    setTasks((ts) => {
      const exists = ts.some((t) => t.id === task.id)
      return exists ? ts.map((t) => (t.id === task.id ? task : t)) : [...ts, task]
    })
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((ts) => ts.filter((t) => t.id !== id))
    setCompletions((cs) => cs.filter((c) => c.taskId !== id))
  }, [])

  const toggleReminder = useCallback((task: Task) => {
    setTasks((ts) =>
      ts.map((t) => (t.id === task.id ? { ...t, reminderEnabled: !t.reminderEnabled } : t)),
    )
  }, [])

  const setMember = useCallback((m: MemberName) => {
    setCurrentMemberState(m)
    void setCurrentMember(m)
  }, [])

  const taskById = useCallback((id: string) => tasks.find((t) => t.id === id), [tasks])

  const value = useMemo<DataContextValue>(
    () => ({
      loading,
      tasks,
      completions,
      areas: SEED_AREAS,
      members: SEED_MEMBERS,
      currentMember,
      setMember,
      completeTask,
      uncompleteTask,
      upsertTask,
      deleteTask,
      toggleReminder,
      taskById,
    }),
    [loading, tasks, completions, currentMember, setMember, completeTask, uncompleteTask, upsertTask, deleteTask, toggleReminder, taskById],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
