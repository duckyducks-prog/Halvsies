import { View, StyleSheet } from 'react-native'
import type { Owner } from '../types'
import { color, font, personColors } from '../theme/tokens'
import { Txt } from './Txt'

interface Props {
  owner: Owner
  size?: number
}

/** Initial-in-soft-circle. "Both" shows a split clay/sage disc. */
export function Avatar({ owner, size = 24 }: Props) {
  const r = size / 2
  if (owner === 'Both') {
    return (
      <View style={[styles.both, { width: size, height: size, borderRadius: r }]}>
        <View style={styles.row}>
          <View style={{ flex: 1, backgroundColor: personColors('Meg').soft }} />
          <View style={{ flex: 1, backgroundColor: personColors('Leti').soft }} />
        </View>
        <Txt style={[styles.initial, { fontSize: size * 0.42, color: color.ink }]}>·</Txt>
      </View>
    )
  }
  const c = personColors(owner)
  return (
    <View
      style={[styles.circle, { width: size, height: size, borderRadius: r, backgroundColor: c.soft }]}>
      <Txt style={[styles.initial, { fontSize: size * 0.46, color: c.deep }]}>{owner[0]}</Txt>
    </View>
  )
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  both: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  row: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row' },
  initial: { fontFamily: font.bold, textAlign: 'center' },
})
