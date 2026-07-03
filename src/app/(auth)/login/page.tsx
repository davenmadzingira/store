'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input, Label } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push(searchParams.get('next') || '/account')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <h1 className="font-display text-3xl text-ink-900">Sign in</h1>
      <p className="mt-1 text-sm text-ink-400">Welcome back to the shelf.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-rust">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-4 flex justify-between text-sm">
        <Link href="/reset-password" className="text-ink-500 hover:text-ink-900">
          Forgot password?
        </Link>
        <Link href="/register" className="text-ink-500 hover:text-ink-900">
          Create account
        </Link>
      </div>
    </div>
  )
}
