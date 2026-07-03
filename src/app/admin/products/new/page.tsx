import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/product-form'

export default async function NewProductPage() {
  const supabase = createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">New product</h1>
      <div className="mt-6">
        <ProductForm categories={categories || []} />
      </div>
    </div>
  )
}
