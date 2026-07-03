const FALLBACK_EVENTS = [
  'Someone in Austin bought Lightroom Preset Pack Vol. 2',
  'Someone in Manchester bought The Indie Hacker Notion OS',
  'Someone in Toronto clicked through to Ergonomic Desk Mat',
  'Someone in Berlin bought Freelance Invoice Templates',
  'Someone in Lagos bought Resume Kit for Designers',
  'Someone in Sydney clicked through to Mechanical Keyboard',
]

export function SalesTicker({ events = FALLBACK_EVENTS }: { events?: string[] }) {
  const doubled = [...events, ...events]

  return (
    <div className="overflow-hidden border-y border-ink-700 bg-ink-900 py-2.5">
      <div className="flex w-max animate-ticker gap-10 whitespace-nowrap">
        {doubled.map((event, i) => (
          <span key={i} className="flex items-center gap-2 text-[13px] text-ink-300">
            <span className="h-1 w-1 rounded-full bg-signal" />
            {event}
          </span>
        ))}
      </div>
    </div>
  )
}
