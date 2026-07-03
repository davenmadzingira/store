import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/account')

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-[180px_1fr]">
        <aside>
          <p className="shelf-label mb-3">Account</p>
          <nav className="space-y-2 text-sm text-ink-500">
            <Link href="/account" className="block hover:text-ink-900">Overview</Link>
            <Link href="/account/orders" className="block hover:text-ink-900">Orders</Link>
            <Link href="/account/downloads" className="block hover:text-ink-900">Downloads</Link>
            <Link href="/account/affiliate" className="block hover:text-ink-900">Affiliate</Link>
            <Link href="/account/settings" className="block hover:text-ink-900">Settings</Link>
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  )
}
