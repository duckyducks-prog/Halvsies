import AsyncStorage from '@react-native-async-storage/async-storage'
import type { MemberName } from '../types'

const KEY = 'halvsies.me.v1'

let cached: MemberName = 'Meg'

/** Load the persisted device identity once at startup. */
export async function loadCurrentMember(): Promise<MemberName> {
  const v = await AsyncStorage.getItem(KEY)
  cached = v === 'Leti' ? 'Leti' : 'Meg'
  return cached
}

export function getCurrentMember(): MemberName {
  return cached
}

export async function setCurrentMember(name: MemberName): Promise<void> {
  cached = name
  await AsyncStorage.setItem(KEY, name)
}

export function partnerOf(name: MemberName): MemberName {
  return name === 'Meg' ? 'Leti' : 'Meg'
}
