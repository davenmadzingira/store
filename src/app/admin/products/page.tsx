import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import type { Product } from '@/types/database'

export default async function AdminProductsPage() {
  const supabase = createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink-900">Products</h1>
        <Link href="/admin/products/new" className="rounded bg-ink-900 px-4 py-2 text-sm font-medium text-paper hover:bg-ink-700">
          + New product
        </Link>
      </div>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-ink-900 text-left text-xs text-ink-400">
            <th className="py-2">Title</th>
            <th className="py-2">Type</th>
            <th className="py-2">Price</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {(products as Product[] | null)?.map((p) => (
            <tr key={p.id}>
              <td className="py-3 font-medium text-ink-900">{p.title}</td>
              <td className="py-3 capitalize text-ink-500">{p.type}</td>
              <td className="price-mono py-3 text-ink-700">
                {p.type === 'digital' ? formatPrice(p.price_cents, p.currency) : `${p.affiliate_commission_pct ?? 0}%`}
              </td>
              <td className="py-3">
                <StatusPill status={p.status} />
              </td>
              <td className="py-3 text-right">
                <Link href={`/admin/products/${p.id}`} className="text-ink-500 hover:text-ink-900">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(!products || products.length === 0) && (
        <p className="mt-10 text-sm text-ink-400">No products yet. Create your first one.</p>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: 'bg-moss/10 text-moss',
    draft: 'bg-ink-100 text-ink-500',
    archived: 'bg-rust/10 text-rust',
  }
  return (
    <span className={`rounded-sm px-2 py-0.5 text-xs capitalize ${styles[status] || ''}`}>{status}</span>
  )
}
