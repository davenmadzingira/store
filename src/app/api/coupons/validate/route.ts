import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { code, subtotalCents } = await req.json()

  if (!code || typeof subtotalCents !== 'number') {
    return NextResponse.json({ valid: false, message: 'Missing code or subtotal' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .eq('is_active', true)
    .single()

  if (!coupon) {
    return NextResponse.json({ valid: false, message: 'Coupon not found' })
  }

  const now = new Date()
  if (new Date(coupon.starts_at) > now) {
    return NextResponse.json({ valid: false, message: 'This coupon is not active yet' })
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return NextResponse.json({ valid: false, message: 'This coupon has expired' })
  }
  if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
    return NextResponse.json({ valid: false, message: 'This coupon has reached its redemption limit' })
  }
  if (subtotalCents < coupon.min_order_cents) {
    return NextResponse.json({
      valid: false,
      message: `This coupon requires a minimum order of $${(coupon.min_order_cents / 100).toFixed(2)}`,
    })
  }

  const discountCents =
    coupon.discount_type === 'percent'
      ? Math.round((subtotalCents * coupon.discount_value) / 100)
      : Math.round(coupon.discount_value * 100)

  return NextResponse.json({
    valid: true,
    discountCents: Math.min(discountCents, subtotalCents),
    message: `Coupon applied — ${coupon.discount_type === 'percent' ? `${coupon.discount_value}% off` : `$${coupon.discount_value} off`}`,
  })
}
