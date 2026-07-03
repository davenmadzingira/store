'use client'

import { useState } from 'react'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="font-display text-2xl text-ink-900">Message sent</h1>
        <p className="mt-2 text-sm text-ink-500">We'll get back to you within a day or two.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-display text-3xl text-ink-900">Get in touch</h1>
      <p className="mt-2 text-sm text-ink-400">
        Questions about an order, a product, or anything else — write to us below.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </div>

        {status === 'error' && (
          <p className="text-sm text-rust">Something went wrong. Please try again.</p>
        )}

        <Button type="submit" disabled={status === 'sending'} size="lg" className="w-full">
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </Button>
      </form>
    </div>
  )
}
