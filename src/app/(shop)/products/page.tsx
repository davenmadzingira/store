import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/product-card'
import { ProductFilters } from '@/components/shop/product-filters'
import type { Product, Category } from '@/types/database'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All products',
  description: 'Browse digital products and curated affiliate finds.',
}

interface ProductsPageProps {
  searchParams: {
    type?: string
    category?: string
    q?: string
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const supabase = createClient()
  const { type, category, q } = searchParams

  const { data: categories } = await supabase.from('categories').select('*').order('name')

  let query = supabase.from('products').select('*, category:categories(*)').eq('status', 'published')

  if (type === 'digital' || type === 'affiliate') {
    query = query.eq('type', type)
  }

  if (category && categories) {
    const cat = (categories as Category[]).find((c) => c.slug === category)
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (q && q.trim()) {
    query = query.textSearch('search_vector', q.trim(), { type: 'websearch' })
  }

  const { data: products } = await query.order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-8 border-b border-ink-900 pb-4">
        <p className="shelf-label">Catalogue</p>
        <h1 className="mt-1 font-display text-3xl text-ink-900">
          {q ? `Results for “${q}”` : 'All products'}
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          {(products as Product[] | null)?.length ?? 0} item
          {(products as Product[] | null)?.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-[180px_1fr]">
        <ProductFilters
          categories={(categories as Category[]) || []}
          activeType={type}
          activeCategory={category}
          query={q}
        />

        <div>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
              {(products as Product[]).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-ink-200 py-20 text-center">
              <p className="text-sm text-ink-400">
                Nothing matches that search. Try a different term or browse all products.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
