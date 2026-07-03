'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/lib/cart-store'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const clear = useCart((s) => s.clear)
  const [cleared, setCleared] = useState(false)

  useEffect(() => {
    if (!cleared) {
      clear()
      setCleared(true)
    }
  }, [cleared, clear])

  const orderRef = searchParams.get('order') || searchParams.get('session_id')

  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-moss/10">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3D4A3A" strokeWidth="2">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="mt-6 font-display text-3xl text-ink-900">Order confirmed</h1>
      <p className="mt-2 text-sm text-ink-500">
        Check your email for your receipt and download links. They'll arrive within a minute or two.
      </p>
      {orderRef && (
        <p className="mt-3 price-mono text-xs text-ink-300">Reference: {orderRef.slice(0, 16)}</p>
      )}
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/account/orders"
          className="rounded bg-ink-900 px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink-700"
        >
          View order history
        </Link>
        <Link
          href="/products"
          className="rounded border border-ink-200 px-5 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-50"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
