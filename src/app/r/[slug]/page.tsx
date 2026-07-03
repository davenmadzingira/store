import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'

interface RedirectPageProps {
  params: { slug: string }
}

export default async function AffiliateRedirectPage({ params }: RedirectPageProps) {
  const supabase = createAdminClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .eq('type', 'affiliate')
    .eq('status', 'published')
    .single()

  if (!product || !product.affiliate_url) {
    notFound()
  }

  // If this visitor arrived via a site affiliate's link (?ref=CODE earlier in
  // their session), credit the click to that code via a stored cookie.
  const cookieStore = cookies()
  const referredByCode = cookieStore.get('ref_code')?.value || null

  await supabase.from('affiliate_clicks').insert({
    product_id: product.id,
    referred_by_code: referredByCode,
  })

  redirect(product.affiliate_url)
}
