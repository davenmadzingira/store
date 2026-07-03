'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart-store'

export function CartLink() {
  const items = useCart((s) => s.items)
  const [count, setCount] = useState(0)

  // Avoid hydration mismatch — compute count only after mount.
  useEffect(() => {
    setCount(items.reduce((sum, i) => sum + i.quantity, 0))
  }, [items])

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-1.5 text-sm text-ink-700 hover:text-ink-900"
      aria-label={`Cart, ${count} items`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2 5h13" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="21" r="1" />
        <circle cx="18" cy="21" r="1" />
      </svg>
      <span className="hidden sm:inline">Cart</span>
      {count > 0 && (
        <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-signal text-[10px] font-medium text-paper">
          {count}
        </span>
      )}
    </Link>
  )
}
