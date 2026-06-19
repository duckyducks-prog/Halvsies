import type { Chore } from '../types'
import { OwnerBadge } from './OwnerBadge'
import { FrequencyChip } from './FrequencyChip'
import { dueLabel, isDue } from '../lib/frequency'

interface Props {
  chore: Chore
  onToggle: (chore: Chore) => void
  onEdit: (chore: Chore) => void
  onToggleReminder: (chore: Chore) => void
  onNudge: (chore: Chore) => void
}

export function ChoreRow({ chore, onToggle, onEdit, onToggleReminder, onNudge }: Props) {
  const due = isDue(chore)
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <button
        aria-label={chore.done ? 'Mark not done' : 'Mark done'}
        onClick={() => onToggle(chore)}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
          chore.done
            ? 'border-brand-600 bg-brand-600 text-white'
            : 'border-slate-300 bg-white text-transparent active:bg-slate-100'
        }`}
      >
        ✓
      </button>

      <button onClick={() => onEdit(chore)} className="flex min-w-0 flex-1 flex-col items-start text-left">
        <span className={`truncate text-[15px] ${chore.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
          {chore.name}
        </span>
        <span className="mt-1 flex items-center gap-2">
          <FrequencyChip frequency={chore.frequency} />
          <span className={`text-[11px] font-medium ${due && !chore.done ? 'text-rose-600' : 'text-slate-400'}`}>
            {dueLabel(chore)}
          </span>
        </span>
      </button>

      <button
        aria-label={chore.reminderEnabled ? 'Turn reminder off' : 'Turn reminder on'}
        aria-pressed={chore.reminderEnabled}
        onClick={() => onToggleReminder(chore)}
        className={`shrink-0 rounded-full p-1.5 text-base transition active:scale-90 ${
          chore.reminderEnabled ? 'opacity-100' : 'opacity-30'
        }`}
        title={chore.reminderEnabled ? 'Reminder on' : 'Reminder off'}
      >
        {chore.reminderEnabled ? '🔔' : '🔕'}
      </button>

      <button
        aria-label="Nudge partner about this chore"
        onClick={() => onNudge(chore)}
        className="shrink-0 rounded-full p-1.5 text-base opacity-60 transition active:scale-90"
        title="Nudge partner"
      >
        👋
      </button>

      <OwnerBadge owner={chore.owner} />
    </li>
  )
}
