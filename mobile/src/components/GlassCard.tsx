import { BlurView } from 'expo-blur'
import { StyleSheet, type ViewProps } from 'react-native'
import { radius } from '../theme/tokens'

interface Props extends ViewProps {
  padded?: boolean
}

/** Frosted-glass card for use over full-bleed photos — the photo shows through.
 *  A translucent white fill over the blur keeps text legible on busy photos. */
export function GlassCard({ padded = true, style, children, ...rest }: Props) {
  return (
    <BlurView intensity={24} tint="light" style={[styles.card, padded && { padding: 14 }, style]} {...rest}>
      {children}
    </BlurView>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.5)',
  },
})
