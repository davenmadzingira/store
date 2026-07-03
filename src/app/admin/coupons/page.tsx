import { createClient } from '@/lib/supabase/server'
import { CouponsManager } from '@/components/admin/coupons-manager'

export default async function AdminCouponsPage() {
  const supabase = createClient()
  const { data: coupons } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Coupons</h1>
      <div className="mt-6">
        <CouponsManager initialCoupons={coupons || []} />
      </div>
    </div>
  )
}
