import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: { token: string }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { token } = params
  const supabase = createAdminClient()

  const { data: orderItem } = await supabase
    .from('order_items')
    .select('*, product:products(*), order:orders(status)')
    .eq('download_token', token)
    .single()

  if (!orderItem) {
    return new NextResponse('Download link not found.', { status: 404 })
  }

  const order = (orderItem as any).order
  if (order?.status !== 'paid') {
    return new NextResponse('This order has not completed payment.', { status: 403 })
  }

  if (orderItem.download_count >= orderItem.download_limit) {
    return new NextResponse(
      'You have reached the download limit for this item. Contact support if you need it again.',
      { status: 403 }
    )
  }

  const product = (orderItem as any).product
  if (!product?.file_path) {
    return new NextResponse('No file is attached to this product.', { status: 404 })
  }

  // Generate a short-lived signed URL directly from Supabase Storage and
  // redirect the browser to it, rather than proxying the file bytes
  // through this server route.
  const { data: signedUrlData, error: signError } = await supabase.storage
    .from('product-files')
    .createSignedUrl(product.file_path, 120, { download: product.title })

  if (signError || !signedUrlData) {
    console.error('Failed to create signed download URL:', signError)
    return new NextResponse('Could not generate a download link. Try again shortly.', { status: 500 })
  }

  await supabase
    .from('order_items')
    .update({ download_count: orderItem.download_count + 1 })
    .eq('id', orderItem.id)

  return NextResponse.redirect(signedUrlData.signedUrl)
}
