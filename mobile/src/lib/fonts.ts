import { useFonts } from 'expo-font'
import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque'
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk'

/** Loads the Halvsies type system; returns true once ready. */
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    Bricolage_700: BricolageGrotesque_700Bold,
    Bricolage_600: BricolageGrotesque_600SemiBold,
    Hanken_400: HankenGrotesk_400Regular,
    Hanken_500: HankenGrotesk_500Medium,
    Hanken_600: HankenGrotesk_600SemiBold,
    Hanken_700: HankenGrotesk_700Bold,
  })
  return loaded
}
