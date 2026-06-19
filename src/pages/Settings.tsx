import { useState } from 'react'
import { SEED_MEMBERS } from '../data/seed'
import { isCloudEnabled } from '../lib/supabase'
import { OwnerBadge } from '../components/OwnerBadge'
import type { MemberName } from '../types'
import { getCurrentMember, setCurrentMember } from '../lib/identity'
import {
  isPushSupported,
  notificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
} from '../lib/push'

export function Settings() {
  const [me, setMe] = useState<MemberName>(getCurrentMember())
  const [permission, setPermission] = useState(notificationPermission())
  const [busy, setBusy] = useState(false)
  const [pushMsg, setPushMsg] = useState<string | null>(null)

  const chooseMember = (name: MemberName) => {
    setCurrentMember(name)
    setMe(name)
  }

  const enableNotifications = async () => {
    setBusy(true)
    setPushMsg(null)
    const res = await subscribeToPush(me)
    setPermission(notificationPermission())
    setPushMsg(res.ok ? 'Notifications enabled on this device 🔔' : res.reason ?? 'Could not enable')
    setBusy(false)
  }

  const disableNotifications = async () => {
    setBusy(true)
    await unsubscribeFromPush()
    setPushMsg('Notifications turned off on this device')
    setBusy(false)
  }

  return (
    <div className="pb-24">
      <header className="px-4 pb-2 pt-[calc(env(safe-area-inset-top)+12px)]">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
      </header>

      <main className="space-y-3 px-4 pt-3">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            This device is
          </h2>
          <div className="flex gap-2">
            {SEED_MEMBERS.map((m) => (
              <button
                key={m.name}
                onClick={() => chooseMember(m.name)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[15px] font-medium transition ${
                  me === m.name ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <OwnerBadge owner={m.name} />
                {m.name}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Used so reminders and nudges reach the right person.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Notifications
          </h2>
          {!isPushSupported() ? (
            <p className="text-sm text-slate-600">
              This device/browser doesn't support push notifications. On iPhone, add Homebase to your
              Home Screen first, then enable notifications here.
            </p>
          ) : (
            <>
              <p className="mb-3 text-sm text-slate-600">
                Get a reminder when your chores are due, and nudges from your partner. Permission:{' '}
                <span className="font-medium">{permission}</span>.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={enableNotifications}
                  disabled={busy}
                  className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                >
                  Enable on this device
                </button>
                <button
                  onClick={disableNotifications}
                  disabled={busy}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 active:bg-slate-100 disabled:opacity-40"
                >
                  Turn off
                </button>
              </div>
              {pushMsg && <p className="mt-2 text-xs text-slate-500">{pushMsg}</p>}
            </>
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Sync</h2>
          <p className="text-sm text-slate-600">
            {isCloudEnabled
              ? 'Cloud sync is on — changes appear live on both phones.'
              : 'Running in local mode (this device only). Add your Supabase keys to .env to sync across both phones, enable reminders, nudges, and the weekly insight.'}
          </p>
        </section>
      </main>
    </div>
  )
}
