import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CartLink } from '@/components/shop/cart-link'
import { SearchBox } from '@/components/shop/search-box'

export async function SiteHeader() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3.5">
        <Link href="/" className="font-display text-xl font-medium tracking-tight text-ink-900">
          Shelf
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-ink-600 md:flex">
          <Link href="/products" className="hover:text-ink-900">All products</Link>
          <Link href="/products?type=digital" className="hover:text-ink-900">Digital</Link>
          <Link href="/products?type=affiliate" className="hover:text-ink-900">Curated finds</Link>
          <Link href="/blog" className="hover:text-ink-900">Journal</Link>
        </nav>

        <div className="ml-auto hidden flex-1 max-w-xs lg:block">
          <SearchBox />
        </div>

        <div className="ml-auto flex items-center gap-5 md:ml-0">
          <Link
            href={user ? '/account' : '/login'}
            className="hidden text-sm text-ink-700 hover:text-ink-900 sm:inline"
          >
            {user ? 'Account' : 'Sign in'}
          </Link>
          <CartLink />
        </div>
      </div>
      <div className="border-t border-ink-100 px-5 py-2 lg:hidden">
        <SearchBox />
      </div>
    </header>
  )
}
