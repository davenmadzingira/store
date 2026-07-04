import type { Profile } from '@/types/database'
import { createClient } from '@/lib/supabase/server'

export default async function AccountOverviewPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const profile = profileData as any

  const { count: orderCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .eq('status', 'paid')
  return (
    <div>
      <h1 className="border-b border-ink-900 pb-4 font-display text-2xl text-ink-900">
        Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
      </h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-md bg-ink-50 p-4">
          <p className="text-xs text-ink-400">Orders placed</p>
          <p className="mt-1 font-display text-2xl text-ink-900">{orderCount ?? 0}</p>
        </div>
        <div className="rounded-md bg-ink-50 p-4">
          <p className="text-xs text-ink-400">Affiliate code</p>
          <p className="mt-1 price-mono text-lg text-ink-900">{profile?.affiliate_code}</p>
        </div>
        <div className="rounded-md bg-ink-50 p-4">
          <p className="text-xs text-ink-400">Email</p>
          <p className="mt-1 text-sm text-ink-900">{profile?.email}</p>
        </div>
      </div>
    </div>
  )
}
