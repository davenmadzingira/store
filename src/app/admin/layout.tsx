import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-[200px_1fr]">
        <aside className="border-r border-ink-100 pr-6">
          <p className="font-display text-lg text-ink-900">Admin</p>
          <nav className="mt-5 space-y-1 text-sm">
            <AdminLink href="/admin">Overview</AdminLink>
            <AdminLink href="/admin/products">Products</AdminLink>
            <AdminLink href="/admin/orders">Orders</AdminLink>
            <AdminLink href="/admin/coupons">Coupons</AdminLink>
            <AdminLink href="/admin/blog">Blog</AdminLink>
            <AdminLink href="/admin/affiliates">Affiliates</AdminLink>
            <AdminLink href="/admin/reports">Sales reports</AdminLink>
          </nav>
          <Link href="/" className="mt-8 block text-xs text-ink-300 hover:text-ink-600">
            ← Back to store
          </Link>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  )
}

function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block rounded px-2 py-1.5 text-ink-600 hover:bg-ink-50 hover:text-ink-900">
      {children}
    </Link>
  )
}
