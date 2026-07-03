import { createAdminClient } from '@/lib/supabase/admin'
import type { Coupon } from '@/types/database'

export interface CheckoutLineInput {
  productId: string
  quantity: number
}

export interface PricedLine {
  productId: string
  title: string
  priceCents: number
  quantity: number
  lineTotalCents: number
}

export interface PricedOrder {
  lines: PricedLine[]
  subtotalCents: number
  discountCents: number
  totalCents: number
  coupon: Coupon | null
  currency: string
}

/**
 * Re-derives prices entirely from the database. The client only ever sends
 * product IDs and quantities — never prices — so a tampered request can't
 * change what's actually charged.
 */
export async function priceCheckout(
  lines: CheckoutLineInput[],
  couponCode?: string | null
): Promise<PricedOrder> {
  if (lines.length === 0) {
    throw new Error('Cart is empty')
  }

  const supabase = createAdminClient()

  const ids = lines.map((l) => l.productId)
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .in('id', ids)
    .eq('status', 'published')
    .eq('type', 'digital')

  if (error) throw error
  if (!products || products.length !== ids.length) {
    throw new Error('One or more products are unavailable')
  }

  const pricedLines: PricedLine[] = lines.map((line) => {
    const product = products.find((p) => p.id === line.productId)!
    const quantity = Math.max(1, Math.min(99, line.quantity))
    return {
      productId: product.id,
      title: product.title,
      priceCents: product.price_cents,
      quantity,
      lineTotalCents: product.price_cents * quantity,
    }
  })

  const subtotalCents = pricedLines.reduce((sum, l) => sum + l.lineTotalCents, 0)

  let coupon: Coupon | null = null
  let discountCents = 0

  if (couponCode) {
    const { data: foundCoupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.trim().toUpperCase())
      .eq('is_active', true)
      .single()

    if (foundCoupon) {
      const now = new Date()
      const isStarted = new Date(foundCoupon.starts_at) <= now
      const isNotExpired = !foundCoupon.expires_at || new Date(foundCoupon.expires_at) > now
      const hasRedemptionsLeft =
        !foundCoupon.max_redemptions || foundCoupon.times_redeemed < foundCoupon.max_redemptions
      const meetsMinimum = subtotalCents >= foundCoupon.min_order_cents

      if (isStarted && isNotExpired && hasRedemptionsLeft && meetsMinimum) {
        coupon = foundCoupon
        discountCents =
          foundCoupon.discount_type === 'percent'
            ? Math.round((subtotalCents * foundCoupon.discount_value) / 100)
            : Math.round(foundCoupon.discount_value * 100)
        discountCents = Math.min(discountCents, subtotalCents)
      }
    }
  }

  const totalCents = Math.max(0, subtotalCents - discountCents)

  return {
    lines: pricedLines,
    subtotalCents,
    discountCents,
    totalCents,
    coupon,
    currency: 'usd',
  }
}
