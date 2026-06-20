import { useEffect } from 'react'
import { Platform } from 'react-native'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAppFonts } from '@/lib/fonts'
import { DataProvider } from '@/state/DataProvider'
import { color } from '@/theme/tokens'

void SplashScreen.preventAutoHideAsync()

// Web only: register the PWA manifest + iOS "Add to Home Screen" metadata so the
// hosted site installs as a standalone, full-screen app with the Halvsies icon.
// (output: "single" ignores +html.tsx, so we inject into the live <head>.)
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const ensure = (selector: string, make: () => HTMLElement) => {
    if (!document.head.querySelector(selector)) document.head.appendChild(make())
  }
  ensure('link[rel="manifest"]', () => {
    const l = document.createElement('link')
    l.rel = 'manifest'
    l.href = '/manifest.json'
    return l
  })
  ensure('link[rel="apple-touch-icon"]', () => {
    const l = document.createElement('link')
    l.rel = 'apple-touch-icon'
    l.href = '/icon-1024.png'
    return l
  })
  const meta = (name: string, content: string) =>
    ensure(`meta[name="${name}"]`, () => {
      const m = document.createElement('meta')
      m.name = name
      m.content = content
      return m
    })
  meta('apple-mobile-web-app-capable', 'yes')
  meta('mobile-web-app-capable', 'yes')
  meta('apple-mobile-web-app-status-bar-style', 'default')
  meta('apple-mobile-web-app-title', 'Halvsies')
  meta('theme-color', '#F1F2F0')
}

export default function RootLayout() {
  const fontsLoaded = useAppFonts()

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DataProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: color.porcelain },
            }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="new-task" options={{ presentation: 'modal' }} />
            <Stack.Screen name="add-dinner" options={{ presentation: 'modal' }} />
            <Stack.Screen name="nudge" options={{ presentation: 'modal' }} />
            <Stack.Screen name="pick-up" options={{ presentation: 'modal' }} />
            <Stack.Screen name="recipe" options={{ presentation: 'modal' }} />
            <Stack.Screen name="task/[id]" />
            <Stack.Screen name="recipes" />
          </Stack>
        </DataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
