import crypto from 'crypto'

const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET || 'default-dev-secret'
const TOKEN_EXPIRY_DAYS = 30

interface TokenPayload {
  userId: string
  expiresAt: number
}

/**
 * Generate a signed unsubscribe token for a user
 * Token format: base64(payload).signature
 */
export function generateUnsubscribeToken(userId: string): string {
  const expiresAt = Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  const payload: TokenPayload = { userId, expiresAt }
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url')

  const signature = crypto
    .createHmac('sha256', UNSUBSCRIBE_SECRET)
    .update(payloadStr)
    .digest('base64url')

  return `${payloadStr}.${signature}`
}

/**
 * Verify an unsubscribe token and return the userId if valid
 * Returns null if token is invalid or expired
 */
export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const [payloadStr, signature] = token.split('.')

    if (!payloadStr || !signature) {
      return null
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', UNSUBSCRIBE_SECRET)
      .update(payloadStr)
      .digest('base64url')

    if (signature !== expectedSignature) {
      return null
    }

    // Decode and parse payload
    const payload: TokenPayload = JSON.parse(
      Buffer.from(payloadStr, 'base64url').toString('utf8')
    )

    // Check expiry
    if (Date.now() > payload.expiresAt) {
      return null
    }

    return payload.userId
  } catch {
    return null
  }
}
