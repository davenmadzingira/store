import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, formatFileSize } from '@/lib/utils'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import { ProductCard } from '@/components/shop/product-card'
import type { Product } from '@/types/database'
import type { Metadata } from 'next'

interface ProductPageProps {
  params: { slug: string }
}

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  return data as Product | null
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return {}

  return {
    title: product.seo_title || product.title,
    description: product.seo_description || product.short_description,
    openGraph: {
      title: product.seo_title || product.title,
      description: product.seo_description || product.short_description,
      images: product.cover_image_url ? [product.cover_image_url] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  // Affiliate products should route through the tracked redirect, never land here directly via a "buy" action.
  const isAffiliate = product.type === 'affiliate'

  const supabase = createClient()
  const { data: related } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'published')
    .eq('type', product.type)
    .neq('id', product.id)
    .limit(4)

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <nav className="mb-6 text-sm text-ink-400">
        <Link href="/products" className="hover:text-ink-900">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-600">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-md bg-sand">
          {product.cover_image_url ? (
            <Image src={product.cover_image_url} alt={product.title} fill className="object-cover" priority />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-display text-6xl italic text-ink-300">{product.title.charAt(0)}</span>
            </div>
          )}
        </div>

        <div>
          {isAffiliate && (
            <span className="mb-3 inline-block rounded-sm bg-moss px-2 py-0.5 text-[11px] font-medium text-paper">
              Curated find — affiliate link
            </span>
          )}
          <h1 className="font-display text-3xl text-ink-900">{product.title}</h1>
          <p className="mt-2 text-[15px] text-ink-500">{product.short_description}</p>

          <div className="mt-5 border-y border-ink-100 py-5">
            {isAffiliate ? (
              <>
                <p className="price-mono text-lg text-moss">
                  We may earn {product.affiliate_commission_pct ?? 0}% if you buy through our link
                </p>
                <Link
                  href={`/r/${product.slug}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded bg-moss px-5 py-3 text-sm font-medium text-paper hover:bg-moss-dark sm:w-auto"
                >
                  Visit retailer →
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-3">
                  <span className="price-mono text-2xl text-ink-900">
                    {formatPrice(product.price_cents, product.currency)}
                  </span>
                  {product.compare_at_cents && product.compare_at_cents > product.price_cents && (
                    <span className="price-mono text-base text-ink-300 line-through">
                      {formatPrice(product.compare_at_cents, product.currency)}
                    </span>
                  )}
                </div>
                {product.file_size_bytes && (
                  <p className="mt-1 text-xs text-ink-300">
                    Instant download · {formatFileSize(product.file_size_bytes)}
                  </p>
                )}
                <div className="mt-4">
                  <AddToCartButton product={product} />
                </div>
              </>
            )}
          </div>

          <div className="prose prose-sm mt-6 max-w-none text-ink-600 prose-headings:font-display prose-headings:text-ink-900">
            <p>{product.description}</p>
          </div>
        </div>
      </div>

      {related && related.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 border-b border-ink-900 pb-3">
            <p className="shelf-label">You might also like</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {(related as Product[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
