import { createClient } from '@/lib/supabase/server'
import { AffiliateConversionsTable } from '@/components/admin/affiliate-conversions-table'
import { LogConversionForm } from '@/components/admin/log-conversion-form'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types/database'

export default async function AdminAffiliatesPage() {
  const supabase = createClient()

  const [{ data: conversions }, { count: totalClicks }, { data: affiliateProducts }] = await Promise.all([
    supabase.from('affiliate_conversions').select('*').order('created_at', { ascending: false }),
    supabase.from('affiliate_clicks').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('*').eq('type', 'affiliate').eq('status', 'published'),
  ])

  const totalCommissionCents = (conversions || []).reduce((sum, c) => sum + c.commission_cents, 0)
  const pendingCommissionCents = (conversions || [])
    .filter((c) => c.status === 'pending' || c.status === 'approved')
    .reduce((sum, c) => sum + c.commission_cents, 0)

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Affiliates</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric label="Total clicks" value={String(totalClicks ?? 0)} />
        <Metric label="Conversions logged" value={String(conversions?.length ?? 0)} />
        <Metric label="Total commission owed" value={formatPrice(totalCommissionCents)} />
        <Metric label="Pending payout" value={formatPrice(pendingCommissionCents)} />
      </div>

      <div className="mt-8">
        <LogConversionForm affiliateProducts={(affiliateProducts as Product[]) || []} />
      </div>

      <div className="mt-8">
        <p className="shelf-label mb-3">Conversion history</p>
        <AffiliateConversionsTable conversions={conversions || []} />
        {(!conversions || conversions.length === 0) && (
          <p className="mt-6 text-sm text-ink-400">No conversions logged yet.</p>
        )}
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
