import { NextRequest, NextResponse } from 'next/server'
import { createPaypalOrder } from '@/lib/paypal/server'
import { priceCheckout } from '@/lib/checkout-pricing'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { lines, couponCode, email } = await req.json()

    if (!email || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: 'Missing email or cart items' }, { status: 400 })
    }

    const pricedOrder = await priceCheckout(lines, couponCode)

    if (pricedOrder.totalCents < 50) {
      return NextResponse.json(
        { error: 'Order total must be at least $0.50 to process payment' },
        { status: 400 }
      )
    }

    const paypalOrder = await createPaypalOrder(pricedOrder.totalCents, 'USD')

    // PayPal's createOrder doesn't round-trip custom metadata the way
    // Stripe sessions do, so we stash what's needed to fulfill the order
    // in a short-lived table row keyed by the PayPal order ID, and read
    // it back in the capture route.
    const supabaseServer = createClient()
    const { data: { user } } = await supabaseServer.auth.getUser()
    const refCode = cookies().get('ref_code')?.value || null

    const supabase = createAdminClient()
    await supabase.from('pending_paypal_orders').insert({
      paypal_order_id: paypalOrder.id,
      lines,
      coupon_code: pricedOrder.coupon?.code || null,
      email,
      user_id: user?.id || null,
      affiliate_ref: refCode,
    })

    return NextResponse.json({ id: paypalOrder.id })
  } catch (error: any) {
    console.error('PayPal order creation error:', error)
    return NextResponse.json({ error: error.message || 'Could not create PayPal order' }, { status: 500 })
  }
}

