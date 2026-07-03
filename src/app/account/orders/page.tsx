import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order } from '@/types/database'

export default async function OrderHistoryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="border-b border-ink-900 pb-4 font-display text-2xl text-ink-900">Order history</h1>

      {orders && orders.length > 0 ? (
        <div className="mt-6 divide-y divide-ink-100">
          {(orders as any[]).map((order) => (
            <div key={order.id} className="py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-900">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-ink-400">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="price-mono text-sm text-ink-900">{formatPrice(order.total_cents, order.currency)}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-ink-500">
                {order.order_items?.map((item: any) => (
                  <li key={item.id} className="flex items-center justify-between">
                    <span>{item.title_snapshot} ×{item.quantity}</span>
                    {item.download_token && order.status === 'paid' && (
                      <a
                        href={`/api/downloads/${item.download_token}`}
                        className="text-signal-dark hover:underline"
                      >
                        Download
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-ink-400">No orders yet.</p>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'text-moss',
    pending: 'text-amber-600',
    failed: 'text-rust',
    refunded: 'text-ink-400',
  }
  return <p className={`text-xs capitalize ${styles[status] || 'text-ink-400'}`}>{status}</p>
}
