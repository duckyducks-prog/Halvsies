import { View, StyleSheet } from 'react-native'
import { color } from '../theme/tokens'

interface Props {
  meg: number
  leti: number
  height?: number
}

/** Clay/sage split bar showing the Meg vs Leti share. */
export function BalanceBar({ meg, leti, height = 10 }: Props) {
  const total = meg + leti
  const megPct = total > 0 ? meg / total : 0.5
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View style={{ flex: megPct, backgroundColor: color.meg }} />
      <View style={{ flex: 1 - megPct, backgroundColor: color.leti }} />
    </View>
  )
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', overflow: 'hidden', backgroundColor: color.hairline },
})
