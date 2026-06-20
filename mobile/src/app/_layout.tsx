import { useEffect } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAppFonts } from '@/lib/fonts'
import { DataProvider } from '@/state/DataProvider'
import { color } from '@/theme/tokens'

void SplashScreen.preventAutoHideAsync()

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
