'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input, Label } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/account/settings`,
    })

    if (resetError) {
      setError(resetError.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-sm px-5 py-20 text-center">
        <h1 className="font-display text-2xl text-ink-900">Check your email</h1>
        <p className="mt-2 text-sm text-ink-500">
          If an account exists for {email}, a reset link is on its way.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <h1 className="font-display text-3xl text-ink-900">Reset password</h1>
      <p className="mt-1 text-sm text-ink-400">We'll email you a link to choose a new one.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {error && <p className="text-sm text-rust">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </div>
  )
}
