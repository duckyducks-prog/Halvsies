import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'

/** Service-role client — bypasses RLS. Only for use inside Edge Functions. */
export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )
}
