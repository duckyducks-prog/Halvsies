export type Tab = 'chores' | 'groceries' | 'meals' | 'settings'

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'chores', label: 'Chores', icon: '✓' },
  { id: 'groceries', label: 'Groceries', icon: '🛒' },
  { id: 'meals', label: 'Meals', icon: '🍽️' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {TABS.map((t) => (
          <li key={t.id} className="flex-1">
            <button
              onClick={() => onChange(t.id)}
              className={`flex w-full flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                active === t.id ? 'text-brand-600' : 'text-slate-400'
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
