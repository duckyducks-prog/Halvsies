import { Pressable, StyleSheet, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import type { Owner } from '../types'
import { color, personColors } from '../theme/tokens'
import { Txt } from './Txt'

interface Props {
  checked: boolean
  owner: Owner
  size?: number
  onToggle: () => void
}

function fillFor(owner: Owner): string {
  if (owner === 'Both') return color.ink
  return personColors(owner).base
}

/** The single completion affordance: tap to mark a task done. */
export function Checkbox({ checked, owner, size = 26, onToggle }: Props) {
  const fill = fillFor(owner)
  return (
    <Pressable
      hitSlop={10}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onToggle()
      }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: checked ? fill : color.surface,
          borderColor: checked ? fill : color.faint,
        },
      ]}>
      {checked ? (
        <Txt style={[styles.check, { fontSize: size * 0.6 }]} color={color.white}>
          ✓
        </Txt>
      ) : (
        <View />
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  check: { fontFamily: 'Hanken_700', lineHeight: undefined },
})
