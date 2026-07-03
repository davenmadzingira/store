import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <h1 className="font-display text-3xl text-ink-900">Checkout cancelled</h1>
      <p className="mt-2 text-sm text-ink-500">
        No charge was made. Your cart is still saved if you'd like to try again.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/cart"
          className="rounded bg-ink-900 px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink-700"
        >
          Return to cart
        </Link>
        <Link
          href="/products"
          className="rounded border border-ink-200 px-5 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-50"
        >
          Browse products
        </Link>
      </div>
    </div>
  )
}
