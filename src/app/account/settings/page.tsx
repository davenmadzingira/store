'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input, Label } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function AccountSettingsPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setFullName(data.user?.user_metadata?.full_name || '')
    })
  }, [])

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user!.id)
    await supabase.auth.updateUser({ data: { full_name: fullName } })
    setMessage('Profile updated')
    setSavingProfile(false)
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters')
      return
    }
    setSavingPassword(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setMessage(error ? error.message : 'Password updated')
    setNewPassword('')
    setSavingPassword(false)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div>
      <h1 className="border-b border-ink-900 pb-4 font-display text-2xl text-ink-900">Settings</h1>

      {message && <p className="mt-4 text-sm text-moss">{message}</p>}

      <form onSubmit={handleProfileSave} className="mt-6 max-w-sm space-y-3">
        <p className="shelf-label">Profile</p>
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <Button type="submit" variant="secondary" disabled={savingProfile}>
          {savingProfile ? 'Saving…' : 'Save profile'}
        </Button>
      </form>

      <form onSubmit={handlePasswordChange} className="mt-8 max-w-sm space-y-3">
        <p className="shelf-label">Change password</p>
        <div>
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary" disabled={savingPassword}>
          {savingPassword ? 'Updating…' : 'Update password'}
        </Button>
      </form>

      <div className="mt-10 border-t border-ink-100 pt-6">
        <Button variant="ghost" onClick={handleSignOut}>Sign out</Button>
      </div>
    </div>
  )
}
