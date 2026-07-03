'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SearchBox() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-300"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products"
        className="w-full rounded border border-ink-100 bg-paper-dim py-1.5 pl-8 pr-3 text-sm text-ink-900 placeholder:text-ink-300 focus:border-signal focus:bg-paper focus:outline-none"
        aria-label="Search products"
      />
    </form>
  )
}
