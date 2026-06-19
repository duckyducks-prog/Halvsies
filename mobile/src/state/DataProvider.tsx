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
import type { Completion, GroceryItem, Ingredient, MealEntry, MemberName, Recipe, Task } from '../types'
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
  grocery: GroceryItem[]
  recipes: Recipe[]
  meals: MealEntry[]
  areas: typeof SEED_AREAS
  members: typeof SEED_MEMBERS
  currentMember: MemberName
  setMember: (m: MemberName) => void
  // tasks
  completeTask: (task: Task) => void
  uncompleteTask: (task: Task) => void
  upsertTask: (task: Task) => void
  deleteTask: (id: string) => void
  toggleReminder: (task: Task) => void
  taskById: (id: string) => Task | undefined
  // grocery
  addGrocery: (name: string, recipeId?: string | null) => void
  toggleGrocery: (item: GroceryItem) => void
  deleteGrocery: (id: string) => void
  clearPurchased: () => void
  // recipes
  upsertRecipe: (recipe: Recipe) => void
  deleteRecipe: (id: string) => void
  recipeById: (id: string) => Recipe | undefined
  // meals
  addMeal: (m: { date: string; recipeId: string; cook: MemberName | null; pushToGrocery: boolean }) => void
  deleteMeal: (id: string) => void
}

const DataContext = createContext<DataContextValue | null>(null)
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export function DataProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [grocery, setGrocery] = useState<GroceryItem[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [currentMember, setCurrentMemberState] = useState<MemberName>(getCurrentMember())
  const [loading, setLoading] = useState(true)

  const tasksRef = useRef<Task[]>([])
  const compsRef = useRef<Completion[]>([])
  const groceryRef = useRef<GroceryItem[]>([])
  const recipesRef = useRef<Recipe[]>([])
  const mealsRef = useRef<MealEntry[]>([])

  const setTasksBoth = useCallback((n: Task[]) => { tasksRef.current = n; setTasks(n) }, [])
  const setCompsBoth = useCallback((n: Completion[]) => { compsRef.current = n; setCompletions(n) }, [])
  const setGroceryBoth = useCallback((n: GroceryItem[]) => { groceryRef.current = n; setGrocery(n) }, [])
  const setRecipesBoth = useCallback((n: Recipe[]) => { recipesRef.current = n; setRecipes(n) }, [])
  const setMealsBoth = useCallback((n: MealEntry[]) => { mealsRef.current = n; setMeals(n) }, [])

  const applyAll = useCallback(
    (d: cloud.CloudData) => {
      setTasksBoth(d.tasks); setCompsBoth(d.completions); setGroceryBoth(d.grocery)
      setRecipesBoth(d.recipes); setMealsBoth(d.meals)
    },
    [setTasksBoth, setCompsBoth, setGroceryBoth, setRecipesBoth, setMealsBoth],
  )

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
          applyAll(data)
          setLoading(false)
          unsub = cloud.subscribe(async () => {
            const fresh = await cloud.fetchAll()
            if (active) applyAll(fresh)
          })
          return
        } catch {
          // fall through to local
        }
      }
      const local = await loadLocal()
      if (!active) return
      applyAll(local)
      setLoading(false)
    }

    void init()
    return () => { active = false; unsub?.() }
  }, [applyAll])

  // Persist locally (local mode only).
  useEffect(() => {
    if (!loading && !isCloudEnabled) saveLocal({ tasks, completions, grocery, recipes, meals })
  }, [tasks, completions, grocery, recipes, meals, loading])

  // ---- tasks --------------------------------------------------------------
  const completeTask = useCallback((task: Task) => {
    const now = new Date().toISOString()
    const comp: Completion = { id: uid(), taskId: task.id, member: getCurrentMember(), at: now }
    setCompsBoth([...compsRef.current, comp])
    setTasksBoth(tasksRef.current.map((t) => (t.id === task.id ? { ...t, lastDoneAt: now } : t)))
    if (isCloudEnabled) { void cloud.addCompletionCloud(comp); void cloud.patchTaskCloud(task.id, { last_done_at: now }) }
  }, [setCompsBoth, setTasksBoth])

  const uncompleteTask = useCallback((task: Task) => {
    const forTask = compsRef.current.filter((c) => c.taskId === task.id).sort((a, b) => a.at.localeCompare(b.at))
    const latest = forTask[forTask.length - 1]
    if (!latest) return
    const newLast = forTask.length > 1 ? forTask[forTask.length - 2].at : null
    setCompsBoth(compsRef.current.filter((c) => c.id !== latest.id))
    setTasksBoth(tasksRef.current.map((t) => (t.id === task.id ? { ...t, lastDoneAt: newLast } : t)))
    if (isCloudEnabled) { void cloud.deleteCompletionCloud(latest.id); void cloud.patchTaskCloud(task.id, { last_done_at: newLast }) }
  }, [setCompsBoth, setTasksBoth])

  const upsertTask = useCallback((task: Task) => {
    const exists = tasksRef.current.some((t) => t.id === task.id)
    setTasksBoth(exists ? tasksRef.current.map((t) => (t.id === task.id ? task : t)) : [...tasksRef.current, task])
    if (isCloudEnabled) void cloud.upsertTaskCloud(task)
  }, [setTasksBoth])

  const deleteTask = useCallback((id: string) => {
    setTasksBoth(tasksRef.current.filter((t) => t.id !== id))
    setCompsBoth(compsRef.current.filter((c) => c.taskId !== id))
    if (isCloudEnabled) void cloud.deleteTaskCloud(id)
  }, [setTasksBoth, setCompsBoth])

  const toggleReminder = useCallback((task: Task) => {
    const next = !task.reminderEnabled
    setTasksBoth(tasksRef.current.map((t) => (t.id === task.id ? { ...t, reminderEnabled: next } : t)))
    if (isCloudEnabled) void cloud.patchTaskCloud(task.id, { reminder_enabled: next })
  }, [setTasksBoth])

  const taskById = useCallback((id: string) => tasksRef.current.find((t) => t.id === id), [])

  // ---- grocery ------------------------------------------------------------
  const addGrocery = useCallback((name: string, recipeId: string | null = null) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const item: GroceryItem = {
      id: uid(), name: trimmed, status: 'toBuy', addedBy: getCurrentMember(), recipeId, createdAt: new Date().toISOString(),
    }
    setGroceryBoth([...groceryRef.current, item])
    if (isCloudEnabled) void cloud.upsertGroceryCloud(item)
  }, [setGroceryBoth])

  const toggleGrocery = useCallback((item: GroceryItem) => {
    const status: GroceryItem['status'] = item.status === 'toBuy' ? 'inCart' : 'toBuy'
    setGroceryBoth(groceryRef.current.map((g) => (g.id === item.id ? { ...g, status } : g)))
    if (isCloudEnabled) void cloud.patchGroceryCloud(item.id, { status })
  }, [setGroceryBoth])

  const deleteGrocery = useCallback((id: string) => {
    setGroceryBoth(groceryRef.current.filter((g) => g.id !== id))
    if (isCloudEnabled) void cloud.deleteGroceryCloud(id)
  }, [setGroceryBoth])

  const clearPurchased = useCallback(() => {
    const bought = groceryRef.current.filter((g) => g.status === 'inCart')
    setGroceryBoth(groceryRef.current.filter((g) => g.status !== 'inCart'))
    if (isCloudEnabled) bought.forEach((g) => void cloud.deleteGroceryCloud(g.id))
  }, [setGroceryBoth])

  const addIngredients = useCallback((ingredients: Ingredient[], recipeId: string) => {
    const have = new Set(groceryRef.current.map((g) => g.name.trim().toLowerCase()))
    const now = new Date().toISOString()
    const me = getCurrentMember()
    const fresh: GroceryItem[] = []
    for (const ing of ingredients) {
      const key = ing.name.trim().toLowerCase()
      if (!key || have.has(key)) continue
      have.add(key)
      fresh.push({ id: uid(), name: ing.name.trim(), status: 'toBuy', addedBy: me, recipeId, createdAt: now })
    }
    if (fresh.length) {
      setGroceryBoth([...groceryRef.current, ...fresh])
      if (isCloudEnabled) void cloud.insertGroceryManyCloud(fresh)
    }
  }, [setGroceryBoth])

  // ---- recipes ------------------------------------------------------------
  const upsertRecipe = useCallback((recipe: Recipe) => {
    const exists = recipesRef.current.some((r) => r.id === recipe.id)
    setRecipesBoth(exists ? recipesRef.current.map((r) => (r.id === recipe.id ? recipe : r)) : [...recipesRef.current, recipe])
    if (isCloudEnabled) void cloud.upsertRecipeCloud(recipe)
  }, [setRecipesBoth])

  const deleteRecipe = useCallback((id: string) => {
    setRecipesBoth(recipesRef.current.filter((r) => r.id !== id))
    if (isCloudEnabled) void cloud.deleteRecipeCloud(id)
  }, [setRecipesBoth])

  const recipeById = useCallback((id: string) => recipesRef.current.find((r) => r.id === id), [])

  // ---- meals --------------------------------------------------------------
  const addMeal = useCallback(
    (m: { date: string; recipeId: string; cook: MemberName | null; pushToGrocery: boolean }) => {
      const entry: MealEntry = {
        id: uid(), date: m.date, recipeId: m.recipeId, cook: m.cook, pushedToGrocery: m.pushToGrocery,
      }
      setMealsBoth([...mealsRef.current, entry])
      if (isCloudEnabled) void cloud.upsertMealCloud(entry)
      if (m.pushToGrocery) {
        const recipe = recipesRef.current.find((r) => r.id === m.recipeId)
        if (recipe) addIngredients(recipe.ingredients, recipe.id)
      }
    },
    [setMealsBoth, addIngredients],
  )

  const deleteMeal = useCallback((id: string) => {
    setMealsBoth(mealsRef.current.filter((m) => m.id !== id))
    if (isCloudEnabled) void cloud.deleteMealCloud(id)
  }, [setMealsBoth])

  const setMember = useCallback((m: MemberName) => { setCurrentMemberState(m); void setCurrentMember(m) }, [])

  const value = useMemo<DataContextValue>(
    () => ({
      loading, cloud: isCloudEnabled, tasks, completions, grocery, recipes, meals,
      areas: SEED_AREAS, members: SEED_MEMBERS, currentMember, setMember,
      completeTask, uncompleteTask, upsertTask, deleteTask, toggleReminder, taskById,
      addGrocery, toggleGrocery, deleteGrocery, clearPurchased,
      upsertRecipe, deleteRecipe, recipeById, addMeal, deleteMeal,
    }),
    [loading, tasks, completions, grocery, recipes, meals, currentMember, setMember,
      completeTask, uncompleteTask, upsertTask, deleteTask, toggleReminder, taskById,
      addGrocery, toggleGrocery, deleteGrocery, clearPurchased,
      upsertRecipe, deleteRecipe, recipeById, addMeal, deleteMeal],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
