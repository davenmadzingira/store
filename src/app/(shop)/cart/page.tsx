'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/cart-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { items, removeItem, updateQuantity, couponCode, setCoupon, subtotalCents } = useCart()
  const [mounted, setMounted] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [couponStatus, setCouponStatus] = useState<{ valid: boolean; message: string; discountCents?: number } | null>(null)
  const [checkingCoupon, setCheckingCoupon] = useState(false)

  useEffect(() => setMounted(true), [])

  async function applyCoupon() {
    if (!couponInput.trim()) return
    setCheckingCoupon(true)
    setCouponStatus(null)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponInput.trim(),
          subtotalCents: subtotalCents(),
        }),
      })
      const data = await res.json()
      if (data.valid) {
        setCoupon(couponInput.trim().toUpperCase())
        setCouponStatus({ valid: true, message: 'Coupon applied', discountCents: data.discountCents })
      } else {
        setCoupon(null)
        setCouponStatus({ valid: false, message: data.message || 'Invalid coupon code' })
      }
    } catch {
      setCouponStatus({ valid: false, message: 'Could not validate coupon, try again' })
    } finally {
      setCheckingCoupon(false)
    }
  }

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <p className="font-display text-2xl text-ink-900">Your cart is empty</p>
        <p className="mt-2 text-sm text-ink-400">Nothing on the shelf yet — go find something good.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded bg-ink-900 px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink-700"
        >
          Browse products
        </Link>
      </div>
    )
  }

  const subtotal = subtotalCents()
  const discount = couponStatus?.valid ? couponStatus.discountCents ?? 0 : 0
  const total = Math.max(0, subtotal - discount)

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="border-b border-ink-900 pb-4 font-display text-3xl text-ink-900">Your cart</h1>

      <div className="mt-6 grid grid-cols-1 gap-10 sm:grid-cols-[1fr_280px]">
        <div className="divide-y divide-ink-100">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 py-5">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-sand">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center font-display italic text-ink-300">
                    {item.title.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between">
                  <Link href={`/products/${item.slug}`} className="font-display text-[15px] text-ink-900 hover:text-signal-dark">
                    {item.title}
                  </Link>
                  <span className="price-mono text-sm text-ink-900">
                    {formatPrice(item.priceCents * item.quantity)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="h-6 w-6 rounded border border-ink-200 text-sm text-ink-600 hover:bg-ink-50"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="h-6 w-6 rounded border border-ink-200 text-sm text-ink-600 hover:bg-ink-50"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-xs text-ink-400 hover:text-rust"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-md border border-ink-100 p-5">
          <p className="shelf-label mb-3">Order summary</p>

          <div className="flex gap-2">
            <Input
              placeholder="Coupon code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
            />
            <Button variant="ghost" size="sm" onClick={applyCoupon} disabled={checkingCoupon}>
              Apply
            </Button>
          </div>
          {couponStatus && (
            <p className={`mt-2 text-xs ${couponStatus.valid ? 'text-moss' : 'text-rust'}`}>
              {couponStatus.message}
            </p>
          )}

          <div className="mt-5 space-y-2 border-t border-ink-100 pt-4 text-sm">
            <div className="flex justify-between text-ink-500">
              <span>Subtotal</span>
              <span className="price-mono">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-moss">
                <span>Discount</span>
                <span className="price-mono">−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-ink-100 pt-2 font-medium text-ink-900">
              <span>Total</span>
              <span className="price-mono">{formatPrice(total)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-5 block rounded bg-signal py-3 text-center text-sm font-medium text-paper hover:bg-signal-dark"
          >
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
