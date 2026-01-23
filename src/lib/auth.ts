import bcrypt from 'bcrypt'
import crypto from 'crypto'

const BCRYPT_COST_FACTOR = 12

/**
 * Hash a password using bcrypt with cost factor 12
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST_FACTOR)
}

/**
 * Verify a password against a bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate a cryptographically secure session token (32-byte hex string)
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}
