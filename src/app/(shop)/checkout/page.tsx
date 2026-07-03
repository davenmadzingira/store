'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-store'
import { createClient } from '@/lib/supabase/client'
import { Input, Label } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import { StripeCheckoutButton } from '@/components/shop/stripe-checkout-button'
import { PaypalCheckoutButton } from '@/components/shop/paypal-checkout-button'

export default function CheckoutPage() {
  const { items, subtotalCents } = useCart()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email)
    })
  }, [])

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace('/cart')
    }
  }, [mounted, items.length, router])

  if (!mounted || items.length === 0) return null

  const subtotal = subtotalCents()

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="border-b border-ink-900 pb-4 font-display text-3xl text-ink-900">Checkout</h1>

      <div className="mt-6 grid grid-cols-1 gap-10 sm:grid-cols-[1fr_260px]">
        <div>
          <Label htmlFor="email">Email for receipt and downloads</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <div className="mt-8 space-y-4">
            <p className="shelf-label">Pay with</p>
            <StripeCheckoutButton email={email} />
            <div className="relative py-1 text-center text-xs text-ink-300">
              <span className="relative bg-paper px-2">or</span>
              <div className="absolute left-0 top-1/2 -z-10 h-px w-full bg-ink-100" />
            </div>
            <PaypalCheckoutButton email={email} />
          </div>

          <p className="mt-6 text-xs text-ink-300">
            By completing this purchase you agree to receive a digital download link by email.
            All payments are processed securely by Stripe or PayPal — we never see your card details.
          </p>
        </div>

        <div className="rounded-md border border-ink-100 p-5">
          <p className="shelf-label mb-3">Items ({items.length})</p>
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between text-ink-600">
                <span className="line-clamp-1">{item.title} ×{item.quantity}</span>
                <span className="price-mono flex-shrink-0">{formatPrice(item.priceCents * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-ink-100 pt-3 text-sm font-medium text-ink-900">
            <span>Subtotal</span>
            <span className="price-mono">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-ink-300">Coupon discount applied at payment</p>
        </div>
      </div>
    </div>
  )
}
