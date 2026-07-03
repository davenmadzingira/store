'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-store'

export function StripeCheckoutButton({ email }: { email: string }) {
  const { items, couponCode } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          couponCode,
          email,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Something went wrong starting checkout')
      }
    } catch {
      setError('Could not reach the server. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button onClick={handleClick} disabled={loading || !email} size="lg" className="w-full">
        {loading ? 'Redirecting to Stripe…' : 'Pay with card'}
      </Button>
      {error && <p className="mt-2 text-xs text-rust">{error}</p>}
    </div>
  )
}
