'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import slugify from 'slugify'
import type { BlogPost } from '@/types/database'

export function BlogPostForm({ initial }: { initial?: BlogPost }) {
  const router = useRouter()
  const isEdit = !!initial

  const [title, setTitle] = useState(initial?.title || '')
  const [slug, setSlug] = useState(initial?.slug || '')
  const [excerpt, setExcerpt] = useState(initial?.excerpt || '')
  const [contentMd, setContentMd] = useState(initial?.content_md || '')
  const [status, setStatus] = useState(initial?.status || 'draft')
  const [seoTitle, setSeoTitle] = useState(initial?.seo_title || '')
  const [seoDescription, setSeoDescription] = useState(initial?.seo_description || '')
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
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
          .from('blog-images')
          .upload(path, coverImageFile, { upsert: true })
        if (uploadError) throw new Error(uploadError.message)
        const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(path)
        coverImageUrl = urlData.publicUrl
      }

      const { data: { user } } = await supabase.auth.getUser()

      const payload = {
        title,
        slug,
        excerpt: excerpt || null,
        content_md: contentMd,
        cover_image_url: coverImageUrl,
        status,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        author_id: user?.id,
        published_at: status === 'published' ? initial?.published_at || new Date().toISOString() : null,
      }

      if (isEdit) {
        const { error: updateError } = await supabase.from('blog_posts').update(payload).eq('id', initial.id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from('blog_posts').insert(payload)
        if (insertError) throw insertError
      }

      router.push('/admin/blog')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Could not save the post.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {error && <p className="rounded bg-rust/10 p-3 text-sm text-rust">{error}</p>}

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" required value={title} onChange={(e) => handleTitleChange(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="slug">URL slug</Label>
        <Input id="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="content">Content (Markdown)</Label>
        <Textarea
          id="content"
          rows={14}
          required
          value={contentMd}
          onChange={(e) => setContentMd(e.target.value)}
          className="font-mono text-xs"
        />
      </div>

      <div>
        <Label htmlFor="coverImage">Cover image</Label>
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
          <Input placeholder="SEO title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
          <Textarea
            placeholder="SEO description"
            rows={2}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
          />
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
        </select>
      </div>

      <Button type="submit" disabled={saving} size="lg">
        {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create post'}
      </Button>
    </form>
  )
}
