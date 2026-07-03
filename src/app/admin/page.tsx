import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminOverviewPage() {
  const supabase = createClient()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: recentOrders }, { count: productCount }, { count: unreadMessages }] = await Promise.all([
    supabase.from('orders').select('total_cents, status, created_at').gte('created_at', thirtyDaysAgo),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
  ])

  const paidOrders = (recentOrders || []).filter((o) => o.status === 'paid')
  const revenue30d = paidOrders.reduce((sum, o) => sum + o.total_cents, 0)

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Overview</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric label="Revenue (30d)" value={formatPrice(revenue30d)} />
        <Metric label="Orders (30d)" value={String(paidOrders.length)} />
        <Metric label="Published products" value={String(productCount ?? 0)} />
        <Metric label="Unread messages" value={String(unreadMessages ?? 0)} />
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/admin/products/new" className="rounded bg-ink-900 px-4 py-2 text-sm font-medium text-paper hover:bg-ink-700">
          + New product
        </Link>
        <Link href="/admin/blog/new" className="rounded border border-ink-200 px-4 py-2 text-sm font-medium text-ink-900 hover:bg-ink-50">
          + New blog post
        </Link>
        <Link href="/admin/coupons" className="rounded border border-ink-200 px-4 py-2 text-sm font-medium text-ink-900 hover:bg-ink-50">
          Manage coupons
        </Link>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-ink-50 p-4">
      <p className="text-xs text-ink-400">{label}</p>
      <p className="mt-1 font-display text-2xl text-ink-900">{value}</p>
    </div>
  )
}
