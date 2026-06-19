import { useMemo, useState } from 'react'
import type { Chore, Owner } from '../types'
import { useChores } from '../hooks/useChores'
import { SEED_CATEGORIES } from '../data/seed'
import { isDue } from '../lib/frequency'
import { CategorySection } from '../components/CategorySection'
import { AddChoreSheet } from '../components/AddChoreSheet'
import { WeeklyInsightCard } from '../components/WeeklyInsightCard'
import { isCloudEnabled } from '../lib/supabase'
import { sendNudge } from '../lib/push'
import { getCurrentMember } from '../lib/identity'

type OwnerFilter = 'All' | Owner

const OWNER_FILTERS: OwnerFilter[] = ['All', 'Meg', 'Leti', 'Both']

export function Chores() {
  const { chores, loading, error, toggleDone, toggleReminder, upsertChore, deleteChore } =
    useChores()
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>('All')
  const [dueOnly, setDueOnly] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Chore | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2500)
  }

  const handleNudge = async (chore: Chore) => {
    const res = await sendNudge(chore.id, getCurrentMember())
    showToast(res.ok ? 'Nudge sent 👋' : res.reason ?? 'Could not send nudge')
  }

  const filtered = useMemo(() => {
    return chores.filter((c) => {
      if (ownerFilter !== 'All' && c.owner !== ownerFilter) return false
      if (dueOnly && !(isDue(c) && !c.done)) return false
      return true
    })
  }, [chores, ownerFilter, dueOnly])

  const openAdd = () => {
    setEditing(null)
    setSheetOpen(true)
  }
  const openEdit = (chore: Chore) => {
    setEditing(chore)
    setSheetOpen(true)
  }

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-10 bg-slate-50/90 px-4 pb-2 pt-[calc(env(safe-area-inset-top)+12px)] backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Chores</h1>
          {!isCloudEnabled && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              Local mode
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          {OWNER_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setOwnerFilter(f)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                ownerFilter === f ? 'bg-brand-600 text-white' : 'bg-white text-slate-600'
              }`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={() => setDueOnly((d) => !d)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              dueOnly ? 'bg-rose-600 text-white' : 'bg-white text-slate-600'
            }`}
          >
            Due now
          </button>
        </div>
      </header>

      <main className="px-4 pt-3">
        <WeeklyInsightCard />

        {loading && <p className="py-10 text-center text-slate-400">Loading…</p>}
        {error && (
          <p className="mb-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
        )}

        {!loading &&
          SEED_CATEGORIES.map((cat) => (
            <CategorySection
              key={cat.id}
              category={cat}
              chores={filtered.filter((c) => c.categoryId === cat.id)}
              onToggle={toggleDone}
              onEdit={openEdit}
              onToggleReminder={toggleReminder}
              onNudge={handleNudge}
            />
          ))}

        {!loading && filtered.length === 0 && (
          <p className="py-10 text-center text-slate-400">Nothing here — you're all caught up! 🎉</p>
        )}
      </main>

      {toast && (
        <div className="fixed inset-x-0 bottom-28 z-40 flex justify-center px-4">
          <div className="rounded-full bg-slate-800 px-4 py-2 text-sm text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}

      {/* Floating add button */}
      <button
        onClick={openAdd}
        className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-3xl text-white shadow-lg active:scale-95"
        aria-label="Add chore"
      >
        +
      </button>

      <AddChoreSheet
        open={sheetOpen}
        editing={editing}
        categories={SEED_CATEGORIES}
        onClose={() => setSheetOpen(false)}
        onSave={upsertChore}
        onDelete={deleteChore}
      />
    </div>
  )
}
