import type { Owner } from '../types'
import { ownerColor, ownerInitials } from '../lib/members'

export function OwnerBadge({ owner }: { owner: Owner }) {
  return (
    <span
      className="inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white shadow-sm"
      style={{ backgroundColor: ownerColor(owner) }}
      title={owner}
    >
      {ownerInitials(owner)}
    </span>
  )
}
