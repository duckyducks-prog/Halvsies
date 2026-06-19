import type { Owner } from '../types'
import { SEED_MEMBERS } from '../data/seed'

const COLORS: Record<Owner, string> = {
  Meg: SEED_MEMBERS.find((m) => m.name === 'Meg')!.color,
  Leti: SEED_MEMBERS.find((m) => m.name === 'Leti')!.color,
  Both: '#7c3aed',
}

export function ownerColor(owner: Owner): string {
  return COLORS[owner]
}

export function ownerInitials(owner: Owner): string {
  if (owner === 'Both') return 'M·L'
  return owner[0]
}
