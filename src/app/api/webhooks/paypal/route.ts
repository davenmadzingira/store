import { NextRequest, NextResponse } from 'next/server'
import { verifyPaypalWebhookSignature } from '@/lib/paypal/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const headers = req.headers

  const isValid = await verifyPaypalWebhookSignature({
    authAlgo: headers.get('paypal-auth-algo') || '',
    certUrl: headers.get('paypal-cert-url') || '',
    transmissionId: headers.get('paypal-transmission-id') || '',
    transmissionSig: headers.get('paypal-transmission-sig') || '',
    transmissionTime: headers.get('paypal-transmission-time') || '',
    webhookId: process.env.PAYPAL_WEBHOOK_ID!,
    body,
  })

  if (!isValid) {
    console.error('PayPal webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Note: the primary fulfillment path is the synchronous capture-order
  // route (called right after the buyer approves payment in the PayPal
  // button flow). This webhook exists as a safety net for asynchronous
  // events — refunds, disputes, and delayed payment completions — that
  // the synchronous flow can't observe.
  switch (body.event_type) {
    case 'PAYMENT.CAPTURE.REFUNDED': {
      const captureId = body.resource?.id
      if (captureId) {
        await supabase
          .from('orders')
          .update({ status: 'refunded' })
          .eq('payment_intent_id', captureId)
      }
      break
    }
    case 'PAYMENT.CAPTURE.DENIED': {
      const captureId = body.resource?.id
      if (captureId) {
        await supabase
          .from('orders')
          .update({ status: 'failed' })
          .eq('payment_intent_id', captureId)
      }
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
