import { useState } from 'react'
import type { Chore, ChoreCategory } from '../types'
import { ChoreRow } from './ChoreRow'

interface Props {
  category: ChoreCategory
  chores: Chore[]
  onToggle: (chore: Chore) => void
  onEdit: (chore: Chore) => void
}

export function CategorySection({ category, chores, onToggle, onEdit }: Props) {
  const [open, setOpen] = useState(true)
  if (chores.length === 0) return null

  const remaining = chores.filter((c) => !c.done).length

  return (
    <section className="mb-3 overflow-hidden rounded-2xl bg-white shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {category.name}
        </span>
        <span className="flex items-center gap-2 text-xs text-slate-400">
          <span className="rounded-full bg-slate-100 px-2 py-0.5">{remaining} left</span>
          <span className={`transition ${open ? 'rotate-90' : ''}`}>›</span>
        </span>
      </button>
      {open && (
        <ul className="divide-y divide-slate-100 border-t border-slate-100">
          {chores.map((c) => (
            <ChoreRow key={c.id} chore={c} onToggle={onToggle} onEdit={onEdit} />
          ))}
        </ul>
      )}
    </section>
  )
}
