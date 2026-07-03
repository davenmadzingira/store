import { NextRequest, NextResponse } from 'next/server'
import { capturePaypalOrder } from '@/lib/paypal/server'
import { priceCheckout } from '@/lib/checkout-pricing'
import { fulfillOrder } from '@/lib/fulfill-order'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Missing PayPal order ID' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: pending } = await supabase
      .from('pending_paypal_orders')
      .select('*')
      .eq('paypal_order_id', orderId)
      .single()

    if (!pending) {
      return NextResponse.json({ success: false, error: 'Order not found or already processed' }, { status: 404 })
    }

    const capture = await capturePaypalOrder(orderId)

    const status = capture?.status
    if (status !== 'COMPLETED') {
      return NextResponse.json({ success: false, error: 'Payment was not completed' }, { status: 400 })
    }

    const pricedOrder = await priceCheckout(pending.lines, pending.coupon_code)

    const { orderId: fulfilledOrderId } = await fulfillOrder({
      pricedOrder,
      email: pending.email,
      userId: pending.user_id,
      paymentProvider: 'paypal',
      paymentIntentId: orderId,
      affiliateRef: pending.affiliate_ref,
    })

    await supabase.from('pending_paypal_orders').delete().eq('paypal_order_id', orderId)

    return NextResponse.json({ success: true, orderId: fulfilledOrderId })
  } catch (error: any) {
    console.error('PayPal capture error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Capture failed' }, { status: 500 })
  }
}
