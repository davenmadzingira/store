'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input, Label } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types/database'

export function LogConversionForm({ affiliateProducts }: { affiliateProducts: Product[] }) {
  const router = useRouter()
  const [affiliateCode, setAffiliateCode] = useState('')
  const [productId, setProductId] = useState('')
  const [orderValue, setOrderValue] = useState('')
  const [commission, setCommission] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { error: insertError } = await supabase.from('affiliate_conversions').insert({
      affiliate_code: affiliateCode.trim(),
      product_id: productId,
      order_value_cents: Math.round(parseFloat(orderValue) * 100),
      commission_cents: Math.round(parseFloat(commission) * 100),
      status: 'pending',
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      setAffiliateCode('')
      setOrderValue('')
      setCommission('')
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-md border border-ink-100 p-5">
      <p className="shelf-label">Log a conversion manually</p>
      <p className="text-xs text-ink-400">
        Use this when a retailer reports back that one of your affiliate links converted,
        since most retailers don't post results to your site automatically.
      </p>

      <div>
        <Label htmlFor="affiliateCode">Affiliate code</Label>
        <Input id="affiliateCode" required value={affiliateCode} onChange={(e) => setAffiliateCode(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="product">Product</Label>
        <select
          id="product"
          required
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="w-full rounded border border-ink-200 bg-paper px-3 py-2 text-sm"
        >
          <option value="">Select a product</option>
          {affiliateProducts.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="orderValue">Order value (USD)</Label>
          <Input id="orderValue" type="number" step="0.01" required value={orderValue} onChange={(e) => setOrderValue(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="commission">Commission (USD)</Label>
          <Input id="commission" type="number" step="0.01" required value={commission} onChange={(e) => setCommission(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm text-rust">{error}</p>}

      <Button type="submit" disabled={saving}>
        {saving ? 'Logging…' : 'Log conversion'}
      </Button>
    </form>
  )
}
