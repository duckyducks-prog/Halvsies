import { SEED_MEMBERS } from '../data/seed'
import { isCloudEnabled } from '../lib/supabase'
import { OwnerBadge } from '../components/OwnerBadge'

export function Settings() {
  return (
    <div className="pb-24">
      <header className="px-4 pb-2 pt-[calc(env(safe-area-inset-top)+12px)]">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
      </header>

      <main className="space-y-3 px-4 pt-3">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Household
          </h2>
          <ul className="space-y-3">
            {SEED_MEMBERS.map((m) => (
              <li key={m.name} className="flex items-center gap-3">
                <OwnerBadge owner={m.name} />
                <span className="text-[15px] text-slate-700">{m.name}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Sync
          </h2>
          <p className="text-sm text-slate-600">
            {isCloudEnabled
              ? 'Cloud sync is on — changes appear live on both phones.'
              : 'Running in local mode (this device only). Add your Supabase keys to .env to sync across both phones.'}
          </p>
        </section>
      </main>
    </div>
  )
}
