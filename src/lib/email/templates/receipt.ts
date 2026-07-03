import { formatPrice } from '@/lib/utils'
import type { Order, OrderItem } from '@/types/database'

interface ReceiptParams {
  order: Order
  items: OrderItem[]
  downloadBaseUrl: string
}

export function renderReceiptEmail({ order, items, downloadBaseUrl }: ReceiptParams): string {
  const rows = items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #E8E5E0;">
        <div style="font-weight:500;color:#14110F;">${escapeHtml(item.title_snapshot)}</div>
        ${
          item.download_token
            ? `<a href="${downloadBaseUrl}/${item.download_token}" style="color:#FF5A1F;font-size:13px;text-decoration:none;">Download file →</a>`
            : ''
        }
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #E8E5E0;text-align:right;color:#4A433A;font-family:monospace;">
        ${formatPrice(item.price_cents_snapshot * item.quantity, order.currency)}
      </td>
    </tr>`
    )
    .join('')

  return `
  <div style="background:#F7F4EC;padding:32px 16px;font-family:-apple-system,Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #E8E5E0;">
      <div style="padding:28px 32px;border-bottom:2px solid #14110F;">
        <h1 style="margin:0;font-size:20px;color:#14110F;">Order receipt</h1>
        <p style="margin:4px 0 0;font-size:13px;color:#6E665A;">Order #${order.id.slice(0, 8).toUpperCase()} · ${new Date(order.created_at).toLocaleDateString()}</p>
      </div>
      <div style="padding:24px 32px;">
        <table style="width:100%;border-collapse:collapse;">
          ${rows}
        </table>
        <table style="width:100%;margin-top:16px;">
          <tr>
            <td style="padding:4px 0;color:#6E665A;font-size:13px;">Subtotal</td>
            <td style="padding:4px 0;text-align:right;font-family:monospace;font-size:13px;">${formatPrice(order.subtotal_cents, order.currency)}</td>
          </tr>
          ${
            order.discount_cents > 0
              ? `<tr>
            <td style="padding:4px 0;color:#3D4A3A;font-size:13px;">Discount</td>
            <td style="padding:4px 0;text-align:right;font-family:monospace;font-size:13px;color:#3D4A3A;">−${formatPrice(order.discount_cents, order.currency)}</td>
          </tr>`
              : ''
          }
          <tr>
            <td style="padding:8px 0;color:#14110F;font-weight:500;border-top:1px solid #E8E5E0;">Total</td>
            <td style="padding:8px 0;text-align:right;font-family:monospace;font-weight:500;border-top:1px solid #E8E5E0;">${formatPrice(order.total_cents, order.currency)}</td>
          </tr>
        </table>
      </div>
      <div style="padding:20px 32px;background:#F5F4F2;font-size:12px;color:#9D9486;">
        Downloads are limited to 5 uses per file. Need help? Reply to this email.
      </div>
    </div>
  </div>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
