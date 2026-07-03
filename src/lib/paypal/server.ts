const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com'

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) throw new Error('Failed to authenticate with PayPal')
  const data = await res.json()
  return data.access_token
}

export async function createPaypalOrder(totalCents: number, currency = 'USD') {
  const token = await getAccessToken()

  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: (totalCents / 100).toFixed(2),
          },
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PayPal order creation failed: ${err}`)
  }

  return res.json()
}

export async function capturePaypalOrder(orderId: string) {
  const token = await getAccessToken()

  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PayPal capture failed: ${err}`)
  }

  return res.json()
}

export async function verifyPaypalWebhookSignature(params: {
  authAlgo: string
  certUrl: string
  transmissionId: string
  transmissionSig: string
  transmissionTime: string
  webhookId: string
  body: unknown
}) {
  const token = await getAccessToken()

  const res = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: params.authAlgo,
      cert_url: params.certUrl,
      transmission_id: params.transmissionId,
      transmission_sig: params.transmissionSig,
      transmission_time: params.transmissionTime,
      webhook_id: params.webhookId,
      webhook_event: params.body,
    }),
  })

  if (!res.ok) return false
  const data = await res.json()
  return data.verification_status === 'SUCCESS'
}
