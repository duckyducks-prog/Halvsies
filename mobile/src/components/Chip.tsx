import { Pressable, StyleSheet } from 'react-native'
import { color, radius } from '../theme/tokens'
import { Txt } from './Txt'

interface Props {
  label: string
  selected?: boolean
  onPress?: () => void
  tone?: 'default' | 'ink'
}

export function Chip({ label, selected = false, onPress, tone = 'default' }: Props) {
  const bg = selected ? (tone === 'ink' ? color.ink : color.ink) : color.surface
  const fg = selected ? color.white : color.muted
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { backgroundColor: bg, borderColor: selected ? bg : color.hairline }]}>
      <Txt variant="label" color={fg} style={styles.label}>
        {label}
      </Txt>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: { fontSize: 13 },
})
