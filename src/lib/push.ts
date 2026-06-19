import { supabase, isCloudEnabled } from './supabase'
import type { MemberName } from '../types'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

/** Whether this browser can register Web Push at all. */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission
}

// VAPID keys are base64url; the PushManager wants a Uint8Array.
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(normalized)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export interface PushResult {
  ok: boolean
  reason?: string
}

/**
 * Ask for notification permission, subscribe this device to Web Push, and store
 * the subscription against the given member so reminders/nudges can reach it.
 */
export async function subscribeToPush(member: MemberName): Promise<PushResult> {
  if (!isPushSupported()) return { ok: false, reason: 'Notifications are not supported on this device.' }
  if (!isCloudEnabled || !supabase)
    return { ok: false, reason: 'Connect Supabase (cloud sync) to enable reminders.' }
  if (!VAPID_PUBLIC_KEY) return { ok: false, reason: 'Missing VITE_VAPID_PUBLIC_KEY.' }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { ok: false, reason: 'Notification permission denied.' }

  const reg = await navigator.serviceWorker.ready
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    }))

  const json = sub.toJSON()
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      member,
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    },
    { onConflict: 'endpoint' },
  )
  if (error) return { ok: false, reason: error.message }
  return { ok: true }
}

/** Remove this device's subscription (best-effort). */
export async function unsubscribeFromPush(): Promise<void> {
  if (!isPushSupported()) return
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  if (!sub) return
  const endpoint = sub.endpoint
  await sub.unsubscribe()
  if (isCloudEnabled && supabase) {
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
  }
}

/** Fire-and-forget nudge to the *other* member about a chore. */
export async function sendNudge(choreId: string, from: MemberName): Promise<PushResult> {
  if (!isCloudEnabled || !supabase)
    return { ok: false, reason: 'Connect Supabase to send nudges.' }
  const { error } = await supabase.functions.invoke('nudge', { body: { choreId, from } })
  if (error) return { ok: false, reason: error.message }
  return { ok: true }
}
