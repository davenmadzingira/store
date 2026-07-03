import Link from 'next/link'
import type { Category } from '@/types/database'
import { cn } from '@/lib/utils'

interface ProductFiltersProps {
  categories: Category[]
  activeType?: string
  activeCategory?: string
  query?: string
}

export function ProductFilters({ categories, activeType, activeCategory, query }: ProductFiltersProps) {
  function buildHref(params: Record<string, string | undefined>) {
    const merged = { type: activeType, category: activeCategory, q: query, ...params }
    const search = new URLSearchParams()
    Object.entries(merged).forEach(([k, v]) => {
      if (v) search.set(k, v)
    })
    const qs = search.toString()
    return `/products${qs ? `?${qs}` : ''}`
  }

  return (
    <aside className="space-y-8">
      <div>
        <p className="shelf-label mb-3">Type</p>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              href={buildHref({ type: undefined })}
              className={cn('hover:text-ink-900', !activeType ? 'font-medium text-ink-900' : 'text-ink-500')}
            >
              All products
            </Link>
          </li>
          <li>
            <Link
              href={buildHref({ type: 'digital' })}
              className={cn('hover:text-ink-900', activeType === 'digital' ? 'font-medium text-ink-900' : 'text-ink-500')}
            >
              Digital downloads
            </Link>
          </li>
          <li>
            <Link
              href={buildHref({ type: 'affiliate' })}
              className={cn('hover:text-ink-900', activeType === 'affiliate' ? 'font-medium text-ink-900' : 'text-ink-500')}
            >
              Curated finds
            </Link>
          </li>
        </ul>
      </div>

      {categories.length > 0 && (
        <div>
          <p className="shelf-label mb-3">Category</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href={buildHref({ category: undefined })}
                className={cn('hover:text-ink-900', !activeCategory ? 'font-medium text-ink-900' : 'text-ink-500')}
              >
                All categories
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={buildHref({ category: cat.slug })}
                  className={cn(
                    'hover:text-ink-900',
                    activeCategory === cat.slug ? 'font-medium text-ink-900' : 'text-ink-500'
                  )}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
