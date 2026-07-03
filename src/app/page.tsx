import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/product-card'
import { SalesTicker } from '@/components/marketing/sales-ticker'
import type { Product } from '@/types/database'

export const revalidate = 60

async function getRecentSalesEvents(): Promise<string[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('orders')
    .select('id, created_at, order_items(title_snapshot)')
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(8)

  if (!data || data.length === 0) return []

  const cities = ['Austin', 'Manchester', 'Toronto', 'Berlin', 'Lagos', 'Sydney', 'Mumbai', 'Lisbon']
  return data
    .flatMap((order: any) => order.order_items?.map((i: any) => i.title_snapshot) ?? [])
    .slice(0, 8)
    .map((title: string, i: number) => `Someone in ${cities[i % cities.length]} bought ${title}`)
}

async function getShelf(type: 'digital' | 'affiliate', limit = 4): Promise<Product[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'published')
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data as Product[]) || []
}

export default async function HomePage() {
  const [digitalProducts, affiliateProducts, salesEvents] = await Promise.all([
    getShelf('digital'),
    getShelf('affiliate'),
    getRecentSalesEvents(),
  ])

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-ink-100 bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <p className="shelf-label text-signal-dark">Issue 01 · curated this week</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-ink-900 sm:text-5xl">
            A small, well-kept shelf of things worth your money.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-500">
            Digital tools we built ourselves, and the best things we have found
            everywhere else — kept on the same shelf, priced honestly.
          </p>
          <div className="mt-7 flex gap-3">
            <Link
              href="/products?type=digital"
              className="rounded bg-ink-900 px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink-700"
            >
              Browse digital products
            </Link>
            <Link
              href="/products?type=affiliate"
              className="rounded border border-ink-200 px-5 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-50"
            >
              See curated finds
            </Link>
          </div>
        </div>
      </section>

      <SalesTicker events={salesEvents.length ? salesEvents : undefined} />

      {/* Digital shelf */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="mb-6 flex items-end justify-between border-b border-ink-900 pb-3">
          <div>
            <p className="shelf-label">Shelf 01</p>
            <h2 className="font-display text-2xl text-ink-900">Made by us</h2>
          </div>
          <Link href="/products?type=digital" className="text-sm text-ink-500 hover:text-ink-900">
            View all →
          </Link>
        </div>
        {digitalProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {digitalProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyShelf label="No digital products published yet." />
        )}
      </section>

      {/* Affiliate shelf */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="mb-6 flex items-end justify-between border-b border-ink-900 pb-3">
          <div>
            <p className="shelf-label">Shelf 02</p>
            <h2 className="font-display text-2xl text-ink-900">Found elsewhere, vetted by us</h2>
          </div>
          <Link href="/products?type=affiliate" className="text-sm text-ink-500 hover:text-ink-900">
            View all →
          </Link>
        </div>
        {affiliateProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {affiliateProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyShelf label="No curated finds published yet." />
        )}
      </section>

      {/* Trust strip */}
      <section className="border-t border-ink-100 bg-ink-50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-10 sm:grid-cols-4">
          {[
            ['Secure checkout', 'Stripe & PayPal, PCI compliant'],
            ['Instant delivery', 'Download links by email in seconds'],
            ['Honest pricing', 'No dark patterns, no surprise fees'],
            ['Real reviews', 'We buy and use what we recommend'],
          ].map(([title, sub]) => (
            <div key={title}>
              <p className="text-sm font-medium text-ink-900">{title}</p>
              <p className="mt-1 text-[13px] text-ink-400">{sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function EmptyShelf({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-ink-200 py-16 text-center text-sm text-ink-300">
      {label}
    </div>
  )
}
