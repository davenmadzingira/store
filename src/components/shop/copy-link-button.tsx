'use client'

import { useState } from 'react'

export function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex-shrink-0 rounded border border-ink-200 px-3 py-2 text-xs font-medium text-ink-900 hover:bg-ink-50"
    >
      {copied ? 'Copied ✓' : 'Copy'}
    </button>
  )
}
