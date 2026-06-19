import { type ReactNode } from 'react'
import { View, StyleSheet, type ImageSourcePropType } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { color } from '../theme/tokens'

/**
 * Photo header that fades into the porcelain page (used on Tasks, Grocery,
 * Recipes, Meals, Balance). Title/children render over the photo.
 *
 * NOTE: the brand halftone+grain treatment is approximated here with a scrim +
 * slight contrast; a baked halftone/grain overlay asset can drop in later
 * (see the asset list in the handoff brief).
 */
export function PhotoHeader({
  source,
  height = 236,
  children,
}: {
  source: ImageSourcePropType
  height?: number
  children?: ReactNode
}) {
  return (
    <View style={{ height }}>
      <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      <LinearGradient
        colors={['rgba(20,18,14,0.30)', 'rgba(20,18,14,0.05)', color.porcelain]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.headerContent}>{children}</View>
    </View>
  )
}

/** Full-bleed photo behind the whole screen (Today, This week, Shopping). */
export function FullBleedPhoto({
  source,
  children,
}: {
  source: ImageSourcePropType
  children?: ReactNode
}) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={[color.scrimTop, 'transparent', 'transparent', color.scrimBottom]}
        locations={[0, 0.28, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  headerContent: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 18 },
})
