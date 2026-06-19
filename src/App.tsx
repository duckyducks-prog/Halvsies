import { useState } from 'react'
import { BottomNav, type Tab } from './components/BottomNav'
import { Chores } from './pages/Chores'
import { Settings } from './pages/Settings'
import { Placeholder } from './pages/Placeholder'

export default function App() {
  const [tab, setTab] = useState<Tab>('chores')

  return (
    <div className="mx-auto min-h-screen max-w-md bg-slate-50 text-slate-900">
      {tab === 'chores' && <Chores />}
      {tab === 'groceries' && (
        <Placeholder
          title="Groceries"
          emoji="🛒"
          note="Shared shopping list is coming next (Phase 2)."
        />
      )}
      {tab === 'meals' && (
        <Placeholder
          title="Meals"
          emoji="🍽️"
          note="Weekly meal planning is coming soon (Phase 3)."
        />
      )}
      {tab === 'settings' && <Settings />}

      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
