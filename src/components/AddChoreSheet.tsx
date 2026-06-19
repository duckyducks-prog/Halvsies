import { useEffect, useState } from 'react'
import type { Chore, ChoreCategory, Frequency, Owner } from '../types'
import { SEED_CATEGORIES } from '../data/seed'

const FREQUENCIES: Frequency[] = [
  'Daily',
  'Weekly',
  'Bi-Weekly',
  'Monthly',
  'Quarterly',
  'Seasonal',
  'As needed',
  'Ongoing',
]
const OWNERS: Owner[] = ['Meg', 'Leti', 'Both']

interface Props {
  open: boolean
  /** The chore being edited, or null when adding a new one. */
  editing: Chore | null
  categories: ChoreCategory[]
  onClose: () => void
  onSave: (chore: Chore) => void
  onDelete: (id: string) => void
}

const blank = (): Chore => ({
  id: `chore-${crypto.randomUUID()}`,
  categoryId: SEED_CATEGORIES[0].id,
  name: '',
  frequency: 'Weekly',
  owner: 'Meg',
  done: false,
  lastDoneAt: null,
  sortOrder: Date.now(),
})

export function AddChoreSheet({ open, editing, categories, onClose, onSave, onDelete }: Props) {
  const [draft, setDraft] = useState<Chore>(blank())

  useEffect(() => {
    if (open) setDraft(editing ? { ...editing } : blank())
  }, [open, editing])

  if (!open) return null

  const valid = draft.name.trim().length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200" />
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          {editing ? 'Edit chore' : 'Add chore'}
        </h2>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Name</span>
          <input
            autoFocus
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="e.g. Water the plants"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[15px] outline-none focus:border-brand-500"
          />
        </label>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Category</span>
          <select
            value={draft.categoryId}
            onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[15px] outline-none focus:border-brand-500"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Frequency</span>
            <select
              value={draft.frequency}
              onChange={(e) => setDraft({ ...draft, frequency: e.target.value as Frequency })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[15px] outline-none focus:border-brand-500"
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Owner</span>
            <select
              value={draft.owner}
              onChange={(e) => setDraft({ ...draft, owner: e.target.value as Owner })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[15px] outline-none focus:border-brand-500"
            >
              {OWNERS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex gap-3">
          {editing && (
            <button
              onClick={() => {
                onDelete(editing.id)
                onClose()
              }}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-rose-600 active:bg-rose-50"
            >
              Delete
            </button>
          )}
          <button
            disabled={!valid}
            onClick={() => {
              onSave({ ...draft, name: draft.name.trim() })
              onClose()
            }}
            className="ml-auto rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
