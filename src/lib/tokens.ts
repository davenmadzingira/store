import crypto from 'crypto'

const SECRET = process.env.DOWNLOAD_SIGNING_SECRET!

/**
 * Generates a random opaque token to store on the order_item row.
 * This is the token embedded in the "download" link emailed to customers.
 */
export function generateDownloadToken(): string {
  return crypto.randomBytes(24).toString('hex')
}

/**
 * Signs a short-lived URL for actually streaming bytes out of Supabase
 * Storage. Used internally by the /api/downloads/[token] route after it
 * has verified the opaque token against the database and confirmed the
 * order is paid and the download limit hasn't been exceeded.
 */
export function signPayload(payload: string, expiresInSeconds = 300): string {
  const expiry = Date.now() + expiresInSeconds * 1000
  const data = `${payload}.${expiry}`
  const hmac = crypto.createHmac('sha256', SECRET).update(data).digest('hex')
  return `${data}.${hmac}`
}

export function verifySignedPayload(signed: string): { payload: string; valid: boolean } {
  const parts = signed.split('.')
  if (parts.length !== 3) return { payload: '', valid: false }
  const [payload, expiry, hmac] = parts
  const data = `${payload}.${expiry}`
  const expectedHmac = crypto.createHmac('sha256', SECRET).update(data).digest('hex')

  const validSignature =
    hmac.length === expectedHmac.length &&
    crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))

  const notExpired = Date.now() < Number(expiry)

  return { payload, valid: validSignature && notExpired }
}

export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + SECRET).digest('hex').slice(0, 24)
}
