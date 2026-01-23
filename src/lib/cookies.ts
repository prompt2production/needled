import { cookies } from 'next/headers'

const COOKIE_NAME = 'needled_session'
const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60 // 30 days

/**
 * Set the session cookie with the given token
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: '/',
  })
}

/**
 * Clear the session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

/**
 * Get the session token from request cookies
 * @returns The session token if present, null otherwise
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(COOKIE_NAME)
  return cookie?.value ?? null
}
