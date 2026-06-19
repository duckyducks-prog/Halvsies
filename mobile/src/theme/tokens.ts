// Halvsies design tokens — from the locked system in the handoff.
import { Platform } from 'react-native'

export const color = {
  // canvas / surfaces
  porcelain: '#F1F2F0',
  surface: '#FFFFFF',
  surfaceAlt: '#F6F6F3',
  // ink / text
  ink: '#26241F',
  muted: '#8A8579',
  faint: '#B3AEA2',
  hairline: 'rgba(38,36,31,0.07)',
  // people
  meg: '#B0744A', // clay
  megDeep: '#9A6238',
  megSoft: '#F0E4D8',
  leti: '#558379', // sage
  letiDeep: '#43665E',
  letiSoft: '#E2ECE8',
  // semantic
  rust: '#B4503C', // alert / due
  noteBg: '#F3ECDF',
  noteBorder: '#E5D8C3',
  // on-photo
  white: '#FFFFFF',
  scrimTop: 'rgba(20,18,14,0.45)',
  scrimBottom: 'rgba(20,18,14,0.55)',
} as const

export type Person = 'Meg' | 'Leti'

/** Resolve a person's colour set (Both → clay/sage handled by callers). */
export function personColors(p: Person) {
  return p === 'Meg'
    ? { base: color.meg, deep: color.megDeep, soft: color.megSoft }
    : { base: color.leti, deep: color.letiDeep, soft: color.letiSoft }
}

export const radius = {
  button: 14,
  card: 16,
  pill: 20,
  sheet: 46,
  tabAdd: 16,
} as const

export const space = {
  screen: 24,
  gap: 9,
  section: 18,
} as const

export const font = {
  // Bricolage Grotesque — display (greetings, titles, numbers)
  display: 'Bricolage_700',
  displaySemi: 'Bricolage_600',
  // Hanken Grotesk — all UI text
  regular: 'Hanken_400',
  medium: 'Hanken_500',
  semibold: 'Hanken_600',
  bold: 'Hanken_700',
} as const

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#14120E',
    shadowOpacity: 0.6,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
} as const

export const TAB_BAR_HEIGHT = 64
export const isIOS = Platform.OS === 'ios'
