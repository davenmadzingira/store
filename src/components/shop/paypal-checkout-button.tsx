'use client'

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCart } from '@/lib/cart-store'

export function PaypalCheckoutButton({ email }: { email: string }) {
  const { items, couponCode, clear } = useCart()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''

  if (!email) {
    return <p className="text-xs text-ink-400">Enter your email above to pay with PayPal.</p>
  }

  return (
    <PayPalScriptProvider options={{ clientId, currency: 'USD' }}>
      <PayPalButtons
        style={{ layout: 'vertical', color: 'black', shape: 'rect', label: 'paypal' }}
        createOrder={async () => {
          setError(null)
          const res = await fetch('/api/checkout/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lines: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
              couponCode,
              email,
            }),
          })
          const data = await res.json()
          if (!data.id) {
            setError(data.error || 'Could not start PayPal checkout')
            throw new Error('PayPal order creation failed')
          }
          return data.id
        }}
        onApprove={async (data) => {
          const res = await fetch('/api/checkout/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: data.orderID, email }),
          })
          const result = await res.json()
          if (result.success) {
            clear()
            router.push(`/checkout/success?order=${result.orderId}`)
          } else {
            setError('Payment captured but order processing failed. Contact support with your PayPal receipt.')
          }
        }}
        onError={() => setError('PayPal encountered an error. Please try again.')}
      />
      {error && <p className="mt-2 text-xs text-rust">{error}</p>}
    </PayPalScriptProvider>
  )
}
