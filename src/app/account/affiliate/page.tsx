import type { Profile } from '@/types/database'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/utils'
import { CopyLinkButton } from '@/components/shop/copy-link-button'

export default async function AffiliateDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user!.id)
  .single<Profile>()

  const { count: clickCount } = await supabase
    .from('affiliate_clicks')
    .select('id', { count: 'exact', head: true })
    .eq('referred_by_code', profile?.affiliate_code)

  const { data: conversions } = await supabase
    .from('affiliate_conversions')
    .select('*')
    .eq('referred_by_code', profile?.affiliate_code || '')
    .order('created_at', { ascending: false })

  const totalCommissionCents = (conversions || []).reduce((sum, c) => sum + c.commission_cents, 0)
  const paidCommissionCents = (conversions || [])
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + c.commission_cents, 0)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const referralLink = `${siteUrl}/?ref=${profile?.affiliate_code}`

  return (
    <div>
      <h1 className="border-b border-ink-900 pb-4 font-display text-2xl text-ink-900">Affiliate dashboard</h1>

      <div className="mt-6 rounded-md border border-ink-100 p-4">
        <p className="shelf-label">Your referral link</p>
        <div className="mt-2 flex items-center gap-2">
          <code className="flex-1 truncate rounded bg-ink-50 px-3 py-2 text-xs text-ink-700">{referralLink}</code>
          <CopyLinkButton link={referralLink} />
        </div>
        <p className="mt-2 text-xs text-ink-400">
          Share this link. Anyone who clicks through to a curated find within 30 days credits your account.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Clicks" value={String(clickCount ?? 0)} />
        <Stat label="Conversions" value={String(conversions?.length ?? 0)} />
        <Stat label="Total earned" value={formatPrice(totalCommissionCents)} />
        <Stat label="Paid out" value={formatPrice(paidCommissionCents)} />
      </div>

      <div className="mt-8">
        <p className="shelf-label mb-3">Conversion history</p>
        {conversions && conversions.length > 0 ? (
          <div className="divide-y divide-ink-100 text-sm">
            {conversions.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-ink-900">{formatDate(c.created_at)}</p>
                  <p className="text-xs text-ink-400 capitalize">{c.status}</p>
                </div>
                <p className="price-mono text-ink-900">{formatPrice(c.commission_cents)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-400">No conversions yet — share your link to start earning.</p>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-ink-50 p-4">
      <p className="text-xs text-ink-400">{label}</p>
      <p className="mt-1 font-display text-xl text-ink-900">{value}</p>
    </div>
  )
}
