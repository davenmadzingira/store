import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/admin/product-form'

interface EditProductPageProps {
  params: { id: string }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const supabase = createClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', params.id).single(),
    supabase.from('categories').select('*').order('name'),
  ])

  if (!product) notFound()

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Edit product</h1>
      <div className="mt-6">
        <ProductForm categories={categories || []} initial={product} />
      </div>
    </div>
  )
}
