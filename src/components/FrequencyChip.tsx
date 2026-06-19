import type { Frequency } from '../types'

export function FrequencyChip({ frequency }: { frequency: Frequency }) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
      {frequency}
    </span>
  )
}
