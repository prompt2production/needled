import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { prisma } from './prisma'

const BCRYPT_COST_FACTOR = 12
const SESSION_EXPIRY_DAYS = 30

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

/**
 * Create a new session for a user
 * @returns The session token
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS)

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  })

  return token
}

/**
 * Validate a session token and return the associated user if valid
 * @returns The user if the session is valid, null otherwise
 */
export async function validateSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session) {
    return null
  }

  // Check if session has expired
  if (session.expiresAt < new Date()) {
    // Clean up expired session
    await prisma.session.delete({ where: { id: session.id } })
    return null
  }

  return session.user
}

/**
 * Delete a session by token
 */
export async function deleteSession(token: string): Promise<void> {
  try {
    await prisma.session.delete({ where: { token } })
  } catch {
    // Session may not exist, which is fine (idempotent)
  }
}
