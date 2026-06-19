import webpush from 'npm:web-push@3.6.7'
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') ?? 'mailto:homebase@example.com',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
)

export interface PushSubRow {
  id: string
  member: string
  endpoint: string
  p256dh: string
  auth: string
}

export interface NotificationPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

/**
 * Send a notification to every device registered to any of `members`.
 * Subscriptions that the push service reports as gone (404/410) are pruned.
 */
export async function pushToMembers(
  db: SupabaseClient,
  members: string[],
  payload: NotificationPayload,
): Promise<number> {
  const { data, error } = await db
    .from('push_subscriptions')
    .select('*')
    .in('member', members)
  if (error) throw error

  const subs = (data ?? []) as PushSubRow[]
  let sent = 0
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
        )
        sent++
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) {
          await db.from('push_subscriptions').delete().eq('id', s.id)
        }
      }
    }),
  )
  return sent
}
