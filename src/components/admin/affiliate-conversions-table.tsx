'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'
import type { AffiliateConversion } from '@/types/database'

export function AffiliateConversionsTable({ conversions }: { conversions: AffiliateConversion[] }) {
  const router = useRouter()

  async function updateStatus(id: string, status: string) {
    const supabase = createClient()
    await supabase.from('affiliate_conversions').update({ status }).eq('id', id)
    router.refresh()
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-ink-900 text-left text-xs text-ink-400">
          <th className="py-2">Affiliate code</th>
          <th className="py-2">Order value</th>
          <th className="py-2">Commission</th>
          <th className="py-2">Date</th>
          <th className="py-2">Status</th>
          <th className="py-2"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-ink-100">
        {conversions.map((c) => (
          <tr key={c.id}>
            <td className="price-mono py-3 text-ink-900">{c.affiliate_code}</td>
            <td className="py-3 text-ink-500">{formatPrice(c.order_value_cents)}</td>
            <td className="price-mono py-3 text-ink-900">{formatPrice(c.commission_cents)}</td>
            <td className="py-3 text-xs text-ink-400">{formatDate(c.created_at)}</td>
            <td className="py-3 capitalize text-ink-500">{c.status}</td>
            <td className="py-3 text-right">
              <select
                value={c.status}
                onChange={(e) => updateStatus(c.id, e.target.value)}
                className="rounded border border-ink-200 bg-paper px-2 py-1 text-xs"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
