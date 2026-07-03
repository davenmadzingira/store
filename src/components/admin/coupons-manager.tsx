'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input, Label } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { Coupon } from '@/types/database'

export function CouponsManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [maxRedemptions, setMaxRedemptions] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { error: insertError } = await supabase.from('coupons').insert({
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      max_redemptions: maxRedemptions ? parseInt(maxRedemptions) : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      is_active: true,
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      setCode('')
      setDiscountValue('')
      setMaxRedemptions('')
      setExpiresAt('')
      router.refresh()
    }
    setSaving(false)
  }

  async function toggleActive(coupon: Coupon) {
    const supabase = createClient()
    await supabase.from('coupons').update({ is_active: !coupon.is_active }).eq('id', coupon.id)
    router.refresh()
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="max-w-xl space-y-4 rounded-md border border-ink-100 p-5">
        <p className="shelf-label">New coupon</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">Code</Label>
            <Input id="code" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="SAVE20" />
          </div>
          <div>
            <Label htmlFor="discountType">Type</Label>
            <select
              id="discountType"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as any)}
              className="w-full rounded border border-ink-200 bg-paper px-3 py-2 text-sm"
            >
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed amount off</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="discountValue">
              {discountType === 'percent' ? 'Percent off' : 'Amount off (USD)'}
            </Label>
            <Input
              id="discountValue"
              type="number"
              step="0.01"
              min="0"
              required
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="maxRedemptions">Max redemptions (optional)</Label>
            <Input
              id="maxRedemptions"
              type="number"
              min="1"
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="expiresAt">Expires (optional)</Label>
          <Input id="expiresAt" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </div>
        {error && <p className="text-sm text-rust">{error}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? 'Creating…' : 'Create coupon'}
        </Button>
      </form>

      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-ink-900 text-left text-xs text-ink-400">
            <th className="py-2">Code</th>
            <th className="py-2">Discount</th>
            <th className="py-2">Used</th>
            <th className="py-2">Expires</th>
            <th className="py-2">Active</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {initialCoupons.map((c) => (
            <tr key={c.id}>
              <td className="price-mono py-3 text-ink-900">{c.code}</td>
              <td className="py-3 text-ink-700">
                {c.discount_type === 'percent' ? `${c.discount_value}%` : `$${c.discount_value}`}
              </td>
              <td className="py-3 text-ink-500">
                {c.times_redeemed}{c.max_redemptions ? ` / ${c.max_redemptions}` : ''}
              </td>
              <td className="py-3 text-ink-500">{c.expires_at ? formatDate(c.expires_at) : 'Never'}</td>
              <td className="py-3">
                <button
                  onClick={() => toggleActive(c)}
                  className={`rounded-sm px-2 py-0.5 text-xs ${c.is_active ? 'bg-moss/10 text-moss' : 'bg-ink-100 text-ink-500'}`}
                >
                  {c.is_active ? 'Active' : 'Inactive'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
