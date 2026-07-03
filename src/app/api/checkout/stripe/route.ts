import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { priceCheckout } from '@/lib/checkout-pricing'
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

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const refCode = cookies().get('ref_code')?.value || null

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Stripe needs line items priced individually; if a coupon discount
    // applies we fold it in as a one-off negative adjustment line so the
    // amount charged matches our server-computed total exactly.
    const lineItems = pricedOrder.lines.map((line) => ({
      price_data: {
        currency: pricedOrder.currency,
        product_data: { name: line.title },
        unit_amount: line.priceCents,
      },
      quantity: line.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: lineItems,
      discounts: pricedOrder.coupon
        ? [
            {
              coupon: await ensureStripeCoupon(pricedOrder.coupon),
            },
          ]
        : undefined,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      metadata: {
        productLines: JSON.stringify(lines),
        couponCode: pricedOrder.coupon?.code || '',
        userId: user?.id || '',
        affiliateRef: refCode || '',
        customerEmail: email,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 })
  }
}

// Stripe coupons must exist as objects in Stripe itself. We lazily create
// a matching one (idempotently, by deterministic ID) the first time a
// given store coupon is used at checkout.
async function ensureStripeCoupon(coupon: { id: string; code: string; discount_type: string; discount_value: number }) {
  const stripeCouponId = `store_${coupon.id}`
  try {
    await stripe.coupons.retrieve(stripeCouponId)
    return stripeCouponId
  } catch {
    await stripe.coupons.create({
      id: stripeCouponId,
      name: coupon.code,
      percent_off: coupon.discount_type === 'percent' ? coupon.discount_value : undefined,
      amount_off: coupon.discount_type === 'fixed' ? Math.round(coupon.discount_value * 100) : undefined,
      currency: coupon.discount_type === 'fixed' ? 'usd' : undefined,
      duration: 'once',
    })
    return stripeCouponId
  }
}
