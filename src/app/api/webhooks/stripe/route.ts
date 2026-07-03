import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { priceCheckout } from '@/lib/checkout-pricing'
import { fulfillOrder } from '@/lib/fulfill-order'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true })
    }

    try {
      const lines = JSON.parse(session.metadata?.productLines || '[]')
      const couponCode = session.metadata?.couponCode || null
      const userId = session.metadata?.userId || null
      const affiliateRef = session.metadata?.affiliateRef || null
      const email = session.customer_email || session.metadata?.customerEmail

      if (!email) {
        console.error('Stripe webhook: no email on completed session', session.id)
        return NextResponse.json({ error: 'No email on session' }, { status: 400 })
      }

      // Re-derive pricing again at fulfillment time from current DB state —
      // never trust the amounts Stripe reports back, only that payment succeeded.
      const pricedOrder = await priceCheckout(lines, couponCode)

      await fulfillOrder({
        pricedOrder,
        email,
        userId: userId || null,
        paymentProvider: 'stripe',
        paymentIntentId: session.id,
        affiliateRef,
      })
    } catch (err: any) {
      console.error('Order fulfillment failed for Stripe session', session.id, err)
      // Return 500 so Stripe retries the webhook automatically.
      return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

// Stripe requires the raw request body for signature verification, so we
// must disable Next's default body parsing for this route.
export const config = {
  api: {
    bodyParser: false,
  },
}
