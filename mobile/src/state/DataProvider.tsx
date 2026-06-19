import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Completion, MemberName, Task } from '../types'
import { SEED_AREAS, SEED_MEMBERS } from '../data/seed'
import { loadLocal, saveLocal } from '../lib/store'
import { getCurrentMember, loadCurrentMember, setCurrentMember } from '../lib/identity'
import { isCloudEnabled } from '../lib/supabase'
import * as cloud from '../lib/cloud'

interface DataContextValue {
  loading: boolean
  cloud: boolean
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

  const tasksRef = useRef<Task[]>([])
  const compsRef = useRef<Completion[]>([])
  const setTasksBoth = useCallback((next: Task[]) => {
    tasksRef.current = next
    setTasks(next)
  }, [])
  const setCompsBoth = useCallback((next: Completion[]) => {
    compsRef.current = next
    setCompletions(next)
  }, [])

  // Initial load (+ realtime in cloud mode).
  useEffect(() => {
    let active = true
    let unsub: (() => void) | undefined

    async function init() {
      const me = await loadCurrentMember()
      if (active) setCurrentMemberState(me)

      if (isCloudEnabled) {
        try {
          await cloud.seedIfEmpty()
          const data = await cloud.fetchAll()
          if (!active) return
          setTasksBoth(data.tasks)
          setCompsBoth(data.completions)
          setLoading(false)
          unsub = cloud.subscribe(async () => {
            const fresh = await cloud.fetchAll()
            if (!active) return
            setTasksBoth(fresh.tasks)
            setCompsBoth(fresh.completions)
          })
          return
        } catch {
          // fall through to local on any cloud error
        }
      }
      const local = await loadLocal()
      if (!active) return
      setTasksBoth(local.tasks)
      setCompsBoth(local.completions)
      setLoading(false)
    }

    void init()
    return () => {
      active = false
      unsub?.()
    }
  }, [setTasksBoth, setCompsBoth])

  // Persist to local storage (local mode only).
  useEffect(() => {
    if (!loading && !isCloudEnabled) saveLocal({ tasks, completions })
  }, [tasks, completions, loading])

  const completeTask = useCallback(
    (task: Task) => {
      const now = new Date().toISOString()
      const comp: Completion = { id: uid(), taskId: task.id, member: getCurrentMember(), at: now }
      setCompsBoth([...compsRef.current, comp])
      setTasksBoth(tasksRef.current.map((t) => (t.id === task.id ? { ...t, lastDoneAt: now } : t)))
      if (isCloudEnabled) {
        void cloud.addCompletionCloud(comp)
        void cloud.patchTaskCloud(task.id, { last_done_at: now })
      }
    },
    [setCompsBoth, setTasksBoth],
  )

  const uncompleteTask = useCallback(
    (task: Task) => {
      const forTask = compsRef.current
        .filter((c) => c.taskId === task.id)
        .sort((a, b) => a.at.localeCompare(b.at))
      const latest = forTask[forTask.length - 1]
      if (!latest) return
      const nextComps = compsRef.current.filter((c) => c.id !== latest.id)
      const remaining = forTask.slice(0, -1)
      const newLast = remaining.length ? remaining[remaining.length - 1].at : null
      setCompsBoth(nextComps)
      setTasksBoth(tasksRef.current.map((t) => (t.id === task.id ? { ...t, lastDoneAt: newLast } : t)))
      if (isCloudEnabled) {
        void cloud.deleteCompletionCloud(latest.id)
        void cloud.patchTaskCloud(task.id, { last_done_at: newLast })
      }
    },
    [setCompsBoth, setTasksBoth],
  )

  const upsertTask = useCallback(
    (task: Task) => {
      const exists = tasksRef.current.some((t) => t.id === task.id)
      setTasksBoth(
        exists ? tasksRef.current.map((t) => (t.id === task.id ? task : t)) : [...tasksRef.current, task],
      )
      if (isCloudEnabled) void cloud.upsertTaskCloud(task)
    },
    [setTasksBoth],
  )

  const deleteTask = useCallback(
    (id: string) => {
      setTasksBoth(tasksRef.current.filter((t) => t.id !== id))
      setCompsBoth(compsRef.current.filter((c) => c.taskId !== id))
      if (isCloudEnabled) void cloud.deleteTaskCloud(id)
    },
    [setTasksBoth, setCompsBoth],
  )

  const toggleReminder = useCallback(
    (task: Task) => {
      const next = !task.reminderEnabled
      setTasksBoth(tasksRef.current.map((t) => (t.id === task.id ? { ...t, reminderEnabled: next } : t)))
      if (isCloudEnabled) void cloud.patchTaskCloud(task.id, { reminder_enabled: next })
    },
    [setTasksBoth],
  )

  const setMember = useCallback((m: MemberName) => {
    setCurrentMemberState(m)
    void setCurrentMember(m)
  }, [])

  const taskById = useCallback((id: string) => tasksRef.current.find((t) => t.id === id), [])

  const value = useMemo<DataContextValue>(
    () => ({
      loading,
      cloud: isCloudEnabled,
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
