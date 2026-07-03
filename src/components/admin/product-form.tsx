'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import slugify from 'slugify'
import type { Category, Product } from '@/types/database'

interface ProductFormProps {
  categories: Category[]
  initial?: Product
}

export function ProductForm({ categories, initial }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!initial

  const [type, setType] = useState<'digital' | 'affiliate'>(initial?.type || 'digital')
  const [title, setTitle] = useState(initial?.title || '')
  const [slug, setSlug] = useState(initial?.slug || '')
  const [shortDescription, setShortDescription] = useState(initial?.short_description || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [priceCents, setPriceCents] = useState(initial ? (initial.price_cents / 100).toString() : '')
  const [compareAtCents, setCompareAtCents] = useState(
    initial?.compare_at_cents ? (initial.compare_at_cents / 100).toString() : ''
  )
  const [categoryId, setCategoryId] = useState(initial?.category_id || '')
  const [affiliateUrl, setAffiliateUrl] = useState(initial?.affiliate_url || '')
  const [commissionPct, setCommissionPct] = useState(initial?.affiliate_commission_pct?.toString() || '')
  const [status, setStatus] = useState(initial?.status || 'draft')
  const [seoTitle, setSeoTitle] = useState(initial?.seo_title || '')
  const [seoDescription, setSeoDescription] = useState(initial?.seo_description || '')

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [productFile, setProductFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!isEdit) setSlug(slugify(value, { lower: true, strict: true }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      let coverImageUrl = initial?.cover_image_url || null
      if (coverImageFile) {
        const ext = coverImageFile.name.split('.').pop()
        const path = `${slug}-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, coverImageFile, { upsert: true })
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
        coverImageUrl = urlData.publicUrl
      }

      let filePath = initial?.file_path || null
      let fileSizeBytes = initial?.file_size_bytes || null
      if (productFile) {
        const ext = productFile.name.split('.').pop()
        const path = `${slug}-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('product-files')
          .upload(path, productFile, { upsert: true })
        if (uploadError) throw new Error(`File upload failed: ${uploadError.message}`)
        filePath = path
        fileSizeBytes = productFile.size
      }

      const payload = {
        title,
        slug,
        short_description: shortDescription,
        description,
        type,
        price_cents: type === 'digital' ? Math.round(parseFloat(priceCents || '0') * 100) : 0,
        compare_at_cents: compareAtCents ? Math.round(parseFloat(compareAtCents) * 100) : null,
        category_id: categoryId || null,
        affiliate_url: type === 'affiliate' ? affiliateUrl : null,
        affiliate_commission_pct: type === 'affiliate' ? parseFloat(commissionPct || '0') : null,
        cover_image_url: coverImageUrl,
        file_path: type === 'digital' ? filePath : null,
        file_size_bytes: type === 'digital' ? fileSizeBytes : null,
        status,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
      }

      if (isEdit) {
        const { error: updateError } = await supabase.from('products').update(payload).eq('id', initial.id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from('products').insert(payload)
        if (insertError) throw insertError
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Something went wrong saving the product.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && <p className="rounded bg-rust/10 p-3 text-sm text-rust">{error}</p>}

      <div className="flex gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" checked={type === 'digital'} onChange={() => setType('digital')} />
          Digital product
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" checked={type === 'affiliate'} onChange={() => setType('affiliate')} />
          Affiliate product
        </label>
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" required value={title} onChange={(e) => handleTitleChange(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="slug">URL slug</Label>
        <Input id="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="shortDescription">Short description</Label>
        <Input
          id="shortDescription"
          maxLength={140}
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="description">Full description</Label>
        <Textarea id="description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded border border-ink-200 bg-paper px-3 py-2 text-sm"
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {type === 'digital' ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input id="price" type="number" step="0.01" min="0" required value={priceCents} onChange={(e) => setPriceCents(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="compareAt">Compare-at price (optional)</Label>
              <Input id="compareAt" type="number" step="0.01" min="0" value={compareAtCents} onChange={(e) => setCompareAtCents(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="productFile">
              Product file {initial?.file_path && '(leave empty to keep current file)'}
            </Label>
            <input
              id="productFile"
              type="file"
              onChange={(e) => setProductFile(e.target.files?.[0] || null)}
              className="block w-full text-sm"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <Label htmlFor="affiliateUrl">Affiliate URL</Label>
            <Input
              id="affiliateUrl"
              type="url"
              required
              value={affiliateUrl}
              onChange={(e) => setAffiliateUrl(e.target.value)}
              placeholder="https://retailer.com/product?affid=..."
            />
          </div>
          <div>
            <Label htmlFor="commission">Commission %</Label>
            <Input
              id="commission"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={commissionPct}
              onChange={(e) => setCommissionPct(e.target.value)}
            />
          </div>
        </>
      )}

      <div>
        <Label htmlFor="coverImage">
          Cover image {initial?.cover_image_url && '(leave empty to keep current image)'}
        </Label>
        <input
          id="coverImage"
          type="file"
          accept="image/*"
          onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
          className="block w-full text-sm"
        />
      </div>

      <div className="border-t border-ink-100 pt-5">
        <p className="shelf-label mb-3">SEO (optional)</p>
        <div className="space-y-3">
          <div>
            <Label htmlFor="seoTitle">SEO title</Label>
            <Input id="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="seoDescription">SEO description</Label>
            <Textarea id="seoDescription" rows={2} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="w-full rounded border border-ink-200 bg-paper px-3 py-2 text-sm"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <Button type="submit" disabled={saving} size="lg">
        {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
      </Button>
    </form>
  )
}
