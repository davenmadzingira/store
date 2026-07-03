import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-100 bg-ink-900 text-ink-100">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-display text-lg font-medium text-paper">Shelf</p>
            <p className="mt-2 text-sm text-ink-300">
              A small, well-kept shelf of digital products and curated finds.
            </p>
          </div>
          <div>
            <p className="shelf-label text-ink-400">Shop</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-200">
              <li><Link href="/products" className="hover:text-paper">All products</Link></li>
              <li><Link href="/products?type=digital" className="hover:text-paper">Digital downloads</Link></li>
              <li><Link href="/products?type=affiliate" className="hover:text-paper">Curated finds</Link></li>
            </ul>
          </div>
          <div>
            <p className="shelf-label text-ink-400">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-200">
              <li><Link href="/blog" className="hover:text-paper">Journal</Link></li>
              <li><Link href="/contact" className="hover:text-paper">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="shelf-label text-ink-400">Account</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-200">
              <li><Link href="/login" className="hover:text-paper">Sign in</Link></li>
              <li><Link href="/account/orders" className="hover:text-paper">Order history</Link></li>
              <li><Link href="/account/affiliate" className="hover:text-paper">Become an affiliate</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-ink-700 pt-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Shelf. All rights reserved.</p>
          <p>Payments secured by Stripe and PayPal.</p>
        </div>
      </div>
    </footer>
  )
}
