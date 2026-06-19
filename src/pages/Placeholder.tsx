interface Props {
  title: string
  emoji: string
  note: string
}

/** Simple "coming soon" screen for Phase 2 / 3 modules. */
export function Placeholder({ title, emoji, note }: Props) {
  return (
    <div className="pb-24">
      <header className="px-4 pb-2 pt-[calc(env(safe-area-inset-top)+12px)]">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      </header>
      <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
        <div className="mb-4 text-5xl">{emoji}</div>
        <p className="text-slate-500">{note}</p>
      </div>
    </div>
  )
}
