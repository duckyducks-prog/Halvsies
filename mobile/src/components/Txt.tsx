import { Text, type TextProps, type TextStyle } from 'react-native'
import { color, font } from '../theme/tokens'

type Variant = 'display' | 'title' | 'h2' | 'body' | 'bodyMed' | 'label' | 'meta' | 'eyebrow'

const VARIANTS: Record<Variant, TextStyle> = {
  display: { fontFamily: font.display, fontSize: 33, lineHeight: 37, color: color.ink, letterSpacing: -1 },
  title: { fontFamily: font.display, fontSize: 26, lineHeight: 30, color: color.ink, letterSpacing: -0.6 },
  h2: { fontFamily: font.semibold, fontSize: 16, color: color.ink },
  body: { fontFamily: font.regular, fontSize: 15, color: color.ink },
  bodyMed: { fontFamily: font.medium, fontSize: 15, color: color.ink },
  label: { fontFamily: font.semibold, fontSize: 13, color: color.ink },
  meta: { fontFamily: font.medium, fontSize: 12, color: color.muted },
  eyebrow: {
    fontFamily: font.semibold,
    fontSize: 11,
    color: color.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
}

interface Props extends TextProps {
  variant?: Variant
  color?: string
}

export function Txt({ variant = 'body', color: c, style, ...rest }: Props) {
  return <Text {...rest} style={[VARIANTS[variant], c ? { color: c } : null, style]} />
}
