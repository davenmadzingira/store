import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { SalesChart } from '@/components/admin/sales-chart'

export default async function SalesReportsPage() {
  const supabase = createClient()

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const { data: orders } = await supabase
    .from('orders')
    .select('total_cents, created_at, status')
    .eq('status', 'paid')
    .gte('created_at', ninetyDaysAgo)
    .order('created_at')

  const { data: topItems } = await supabase
    .from('order_items')
    .select('title_snapshot, price_cents_snapshot, quantity, order:orders(status, created_at)')
    .gte('created_at', ninetyDaysAgo)

  // Bucket revenue by day for the chart
  const byDay = new Map<string, { revenue: number; orders: number }>()
  for (const order of orders || []) {
    const day = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const bucket = byDay.get(day) || { revenue: 0, orders: 0 }
    bucket.revenue += order.total_cents / 100
    bucket.orders += 1
    byDay.set(day, bucket)
  }
  const chartData = Array.from(byDay.entries()).map(([date, v]) => ({ date, ...v }))

  // Aggregate by product title for "top products"
  const byProduct = new Map<string, { revenue: number; units: number }>()
  for (const item of (topItems as any[]) || []) {
    if (item.order?.status !== 'paid') continue
    const bucket = byProduct.get(item.title_snapshot) || { revenue: 0, units: 0 }
    bucket.revenue += (item.price_cents_snapshot * item.quantity) / 100
    bucket.units += item.quantity
    byProduct.set(item.title_snapshot, bucket)
  }
  const topProducts = Array.from(byProduct.entries())
    .map(([title, v]) => ({ title, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)

  const totalRevenue = (orders || []).reduce((sum, o) => sum + o.total_cents, 0)
  const totalOrders = (orders || []).length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Sales reports</h1>
      <p className="text-sm text-ink-400">Last 90 days</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Metric label="Total revenue" value={formatPrice(totalRevenue)} />
        <Metric label="Total orders" value={String(totalOrders)} />
        <Metric label="Average order value" value={formatPrice(Math.round(avgOrderValue))} />
      </div>

      <div className="mt-8">
        <p className="shelf-label mb-3">Revenue over time</p>
        {chartData.length > 0 ? (
          <SalesChart data={chartData} />
        ) : (
          <p className="text-sm text-ink-400">No sales data yet in this period.</p>
        )}
      </div>

      <div className="mt-10">
        <p className="shelf-label mb-3">Top products</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-900 text-left text-xs text-ink-400">
              <th className="py-2">Product</th>
              <th className="py-2">Units sold</th>
              <th className="py-2">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {topProducts.map((p) => (
              <tr key={p.title}>
                <td className="py-3 font-medium text-ink-900">{p.title}</td>
                <td className="py-3 text-ink-500">{p.units}</td>
                <td className="price-mono py-3 text-ink-900">{formatPrice(Math.round(p.revenue * 100))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {topProducts.length === 0 && <p className="mt-4 text-sm text-ink-400">No product sales yet.</p>}
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
