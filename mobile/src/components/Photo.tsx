import { type ReactNode } from 'react'
import { View, StyleSheet, Image as RNImage, Platform, type ImageSourcePropType } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { color } from '../theme/tokens'

const halftone = require('../../assets/textures/halftone-tile.png')
const grain = require('../../assets/textures/grain-256.png')

/** Brand photo treatment: tiled halftone + grain over the photo. Native only —
 * `resizeMode="repeat"` doesn't tile on react-native-web (it renders a single
 * square in the corner), so on web we rely on the scrim alone. */
function Treatment() {
  if (Platform.OS === 'web') return null
  return (
    <>
      <RNImage source={halftone} resizeMode="repeat" style={[StyleSheet.absoluteFill, { opacity: 0.12 }]} />
      <RNImage source={grain} resizeMode="repeat" style={[StyleSheet.absoluteFill, { opacity: 0.1 }]} />
    </>
  )
}

const HEADER_SCRIM = {
  colors: ['rgba(28,28,22,0.34)', 'rgba(28,28,22,0.02)', 'rgba(28,28,22,0.50)', 'rgba(28,28,22,0.30)', color.porcelain],
  locations: [0, 0.34, 0.82, 0.9, 1],
} as const
const BLEED_SCRIM = {
  colors: ['rgba(28,26,20,0.50)', 'rgba(28,26,20,0.12)', 'rgba(28,26,20,0.10)', 'rgba(28,26,20,0.36)'],
  locations: [0, 0.24, 0.58, 1],
} as const

/** Photo header that fades into the porcelain page (Tasks, Grocery, Recipes, Meals, Balance). */
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
      <Treatment />
      <LinearGradient
        colors={HEADER_SCRIM.colors}
        locations={HEADER_SCRIM.locations}
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
      <Treatment />
      <LinearGradient
        colors={BLEED_SCRIM.colors}
        locations={BLEED_SCRIM.locations}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  headerContent: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 18 },
})
