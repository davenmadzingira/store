import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const supabase = createClient()

  const [{ data: products }, { data: posts }] = await Promise.all([
    supabase.from('products').select('slug, updated_at').eq('status', 'published'),
    supabase.from('blog_posts').select('slug, updated_at').eq('status', 'published'),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/contact`, changeFrequency: 'monthly', priority: 0.3 },
  ]

  const productRoutes: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${siteUrl}/products/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const blogRoutes: MetadataRoute.Sitemap = (posts || []).map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...productRoutes, ...blogRoutes]
}
