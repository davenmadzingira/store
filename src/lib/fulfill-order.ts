import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/sendgrid'
import { renderReceiptEmail } from '@/lib/email/templates/receipt'
import { generateDownloadToken } from '@/lib/tokens'
import type { PricedOrder } from '@/lib/checkout-pricing'
import type { PaymentProvider } from '@/types/database'

interface FulfillOrderParams {
  pricedOrder: PricedOrder
  email: string
  userId: string | null
  paymentProvider: PaymentProvider
  paymentIntentId: string
  affiliateRef?: string | null
}

/**
 * Single source of truth for "a payment succeeded." Called from both the
 * Stripe and PayPal webhook handlers so order creation, download token
 * generation, coupon redemption counting, and the receipt email always
 * happen the same way regardless of payment method.
 */
export async function fulfillOrder({
  pricedOrder,
  email,
  userId,
  paymentProvider,
  paymentIntentId,
  affiliateRef,
}: FulfillOrderParams) {
  const supabase = createAdminClient()

  // Idempotency: if a webhook fires twice for the same payment, don't double-fulfill.
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (existing) {
    return { orderId: existing.id, alreadyProcessed: true }
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      email,
      status: 'paid',
      subtotal_cents: pricedOrder.subtotalCents,
      discount_cents: pricedOrder.discountCents,
      total_cents: pricedOrder.totalCents,
      currency: pricedOrder.currency,
      coupon_id: pricedOrder.coupon?.id ?? null,
      payment_provider: paymentProvider,
      payment_intent_id: paymentIntentId,
      affiliate_ref: affiliateRef ?? null,
      paid_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (orderError || !order) {
    throw new Error(`Failed to create order: ${orderError?.message}`)
  }

  const orderItemsToInsert = pricedOrder.lines.map((line) => ({
    order_id: order.id,
    product_id: line.productId,
    title_snapshot: line.title,
    price_cents_snapshot: line.priceCents,
    quantity: line.quantity,
    download_token: generateDownloadToken(),
    download_limit: 5,
  }))

  const { data: insertedItems, error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsToInsert)
    .select()

  if (itemsError) {
    throw new Error(`Failed to create order items: ${itemsError.message}`)
  }

  if (pricedOrder.coupon) {
    await supabase
      .from('coupons')
      .update({ times_redeemed: pricedOrder.coupon.times_redeemed + 1 })
      .eq('id', pricedOrder.coupon.id)
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const html = renderReceiptEmail({
    order,
    items: insertedItems || [],
    downloadBaseUrl: `${siteUrl}/api/downloads`,
  })

  await sendEmail({
    to: email,
    subject: `Your order #${order.id.slice(0, 8).toUpperCase()}`,
    html,
  })

  return { orderId: order.id, alreadyProcessed: false }
}
