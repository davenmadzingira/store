import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/utils'

export default async function AdminOrdersPage() {
  const supabase = createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(title_snapshot, quantity)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Orders</h1>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-ink-900 text-left text-xs text-ink-400">
            <th className="py-2">Order</th>
            <th className="py-2">Email</th>
            <th className="py-2">Items</th>
            <th className="py-2">Total</th>
            <th className="py-2">Provider</th>
            <th className="py-2">Status</th>
            <th className="py-2">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {(orders as any[] | null)?.map((order) => (
            <tr key={order.id}>
              <td className="py-3 price-mono text-xs text-ink-500">{order.id.slice(0, 8).toUpperCase()}</td>
              <td className="py-3 text-ink-700">{order.email}</td>
              <td className="py-3 text-ink-500">
                {order.order_items?.map((i: any) => i.title_snapshot).join(', ')}
              </td>
              <td className="price-mono py-3 text-ink-900">{formatPrice(order.total_cents, order.currency)}</td>
              <td className="py-3 capitalize text-ink-500">{order.payment_provider || '—'}</td>
              <td className="py-3">
                <StatusPill status={order.status} />
              </td>
              <td className="py-3 text-xs text-ink-400">{formatDate(order.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {(!orders || orders.length === 0) && <p className="mt-10 text-sm text-ink-400">No orders yet.</p>}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-moss/10 text-moss',
    pending: 'bg-amber-100 text-amber-700',
    failed: 'bg-rust/10 text-rust',
    refunded: 'bg-ink-100 text-ink-500',
  }
  return <span className={`rounded-sm px-2 py-0.5 text-xs capitalize ${styles[status] || ''}`}>{status}</span>
}
