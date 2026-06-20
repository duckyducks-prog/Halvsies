import { BlurView } from 'expo-blur'
import { StyleSheet, View, type ViewProps } from 'react-native'
import { radius, shadow } from '../theme/tokens'

interface Props extends ViewProps {
  padded?: boolean
}

/** Frosted-glass card for use over full-bleed photos. The blur softens the photo
 *  on native; a real white fill layer (a View, not the BlurView's own
 *  backgroundColor — which doesn't paint on web) sits behind the content so text
 *  stays legible everywhere, including the web/PWA build where the blur can't run. */
export function GlassCard({ padded = true, style, children, ...rest }: Props) {
  return (
    <BlurView intensity={24} tint="light" style={[styles.card, padded && styles.padded, style]} {...rest}>
      <View pointerEvents="none" style={styles.fill} />
      {children}
    </BlurView>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.6)',
    ...shadow.card,
  },
  padded: { padding: 14 },
  // Behind the content (rendered first), clipped to the card's rounded corners.
  // High white so it's readable on web where there's no blur to soften the photo.
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.96)' },
})
