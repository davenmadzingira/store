import { createClient } from '@/lib/supabase/server'
import { formatFileSize } from '@/lib/utils'

export default async function DownloadsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, order_items(*, product:products(title, file_size_bytes))')
    .eq('user_id', user!.id)
    .eq('status', 'paid')

  const items = (orders || []).flatMap((o: any) => o.order_items || [])

  return (
    <div>
      <h1 className="border-b border-ink-900 pb-4 font-display text-2xl text-ink-900">Your downloads</h1>

      {items.length > 0 ? (
        <div className="mt-6 divide-y divide-ink-100">
          {items.map((item: any) => {
            const remaining = item.download_limit - item.download_count
            return (
              <div key={item.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-ink-900">{item.title_snapshot}</p>
                  <p className="text-xs text-ink-400">
                    {formatFileSize(item.product?.file_size_bytes)} · {remaining} download{remaining === 1 ? '' : 's'} remaining
                  </p>
                </div>
                {remaining > 0 ? (
                  <a
                    href={`/api/downloads/${item.download_token}`}
                    className="rounded border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-900 hover:bg-ink-50"
                  >
                    Download
                  </a>
                ) : (
                  <span className="text-xs text-ink-300">Limit reached</span>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="mt-6 text-sm text-ink-400">No digital downloads yet.</p>
      )}
    </div>
  )
}
