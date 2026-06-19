import type { MemberName } from '../types'

const KEY = 'homebase.me.v1'

/** Which household member is using this device (defaults to Meg). */
export function getCurrentMember(): MemberName {
  const v = localStorage.getItem(KEY)
  return v === 'Leti' ? 'Leti' : 'Meg'
}

export function setCurrentMember(name: MemberName): void {
  localStorage.setItem(KEY, name)
}

/** The other member — i.e. the person a nudge/reminder is aimed at. */
export function partnerOf(name: MemberName): MemberName {
  return name === 'Meg' ? 'Leti' : 'Meg'
}
