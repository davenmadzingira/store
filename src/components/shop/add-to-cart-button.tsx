'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-store'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types/database'

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem)
  const router = useRouter()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      priceCents: product.price_cents,
      imageUrl: product.cover_image_url,
      quantity: 1,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="flex gap-3">
      <Button onClick={handleAdd} size="lg" className="flex-1">
        {added ? 'Added to cart ✓' : 'Add to cart'}
      </Button>
      <Button
        variant="secondary"
        size="lg"
        onClick={() => {
          handleAdd()
          router.push('/cart')
        }}
      >
        Buy now
      </Button>
    </div>
  )
}
