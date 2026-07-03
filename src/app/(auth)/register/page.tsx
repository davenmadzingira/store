'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input, Label } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="mx-auto max-w-sm px-5 py-20 text-center">
        <h1 className="font-display text-2xl text-ink-900">Check your email</h1>
        <p className="mt-2 text-sm text-ink-500">
          We sent a confirmation link to {email}. Click it to activate your account.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <h1 className="font-display text-3xl text-ink-900">Create account</h1>
      <p className="mt-1 text-sm text-ink-400">Track orders and re-download anytime.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-1 text-xs text-ink-300">At least 8 characters.</p>
        </div>

        {error && <p className="text-sm text-rust">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-4 text-sm text-ink-500">
        Already have an account?{' '}
        <Link href="/login" className="text-ink-900 underline">Sign in</Link>
      </p>
    </div>
  )
}
