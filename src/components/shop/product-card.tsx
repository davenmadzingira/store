import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types/database'

export function ProductCard({ product }: { product: Product }) {
  const isAffiliate = product.type === 'affiliate'
  const href = isAffiliate ? `/r/${product.slug}` : `/products/${product.slug}`
  const onSale = product.compare_at_cents && product.compare_at_cents > product.price_cents

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-sand">
        {product.cover_image_url ? (
          <Image
            src={product.cover_image_url}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-300">
            <span className="font-display text-3xl italic">{product.title.charAt(0)}</span>
          </div>
        )}
        <div className="absolute left-2 top-2">
          {isAffiliate ? (
            <span className="rounded-sm bg-moss px-2 py-0.5 text-[11px] font-medium text-paper">
              Curated find
            </span>
          ) : onSale ? (
            <span className="rounded-sm bg-rust px-2 py-0.5 text-[11px] font-medium text-paper">
              Sale
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 border-t border-ink-100 pt-2.5">
        <p className="font-display text-[15px] leading-snug text-ink-900 line-clamp-1">
          {product.title}
        </p>
        <p className="mt-0.5 text-[13px] text-ink-400 line-clamp-1">
          {product.short_description}
        </p>
        <div className="mt-1.5 flex items-baseline gap-2">
          {isAffiliate ? (
            <span className="price-mono text-sm text-moss">
              Earn {product.affiliate_commission_pct ?? 0}%
            </span>
          ) : (
            <>
              <span className="price-mono text-sm text-ink-900">
                {formatPrice(product.price_cents, product.currency)}
              </span>
              {onSale && (
                <span className="price-mono text-xs text-ink-300 line-through">
                  {formatPrice(product.compare_at_cents!, product.currency)}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
