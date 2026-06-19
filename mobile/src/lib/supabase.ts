import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.EXPO_PUBLIC_SUPABASE_URL
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

/**
 * Supabase client, or `null` when env vars aren't set.
 *
 * Unconfigured → the app runs in **local mode** (AsyncStorage seeded from the
 * chore tracker), so it works in Expo Go with no backend. Set
 * EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY to enable cloud sync, auth, and push.
 */
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null

export const isCloudEnabled = supabase !== null
