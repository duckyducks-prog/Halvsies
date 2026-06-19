import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * The Supabase client, or `null` when env vars aren't set.
 *
 * When null, the app falls back to a localStorage-backed store seeded from the
 * Chore Tracker, so `npm run dev` works out of the box without a backend.
 * Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in `.env` to enable
 * cloud sync and live updates across both phones.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

export const isCloudEnabled = supabase !== null
