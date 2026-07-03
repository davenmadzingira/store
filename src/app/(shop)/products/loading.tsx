export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-8 border-b border-ink-900 pb-4">
        <div className="h-3 w-20 animate-pulse rounded bg-ink-100" />
        <div className="mt-2 h-8 w-48 animate-pulse rounded bg-ink-100" />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[4/3] animate-pulse rounded-md bg-sand" />
            <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-ink-100" />
            <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-ink-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
