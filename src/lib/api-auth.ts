import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from './auth'

const COOKIE_NAME = 'needled_session'

export interface AuthResult {
  user: NonNullable<Awaited<ReturnType<typeof validateSession>>>
  token: string
  source: 'bearer' | 'cookie'
}

/**
 * Get auth token from request - checks Bearer header first, then cookie
 */
export async function getAuthToken(
  request?: NextRequest
): Promise<{ token: string; source: 'bearer' | 'cookie' } | null> {
  // Check Authorization header first (native apps)
  if (request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      if (token) return { token, source: 'bearer' }
    }
  }

  // Fall back to cookie (web app)
  const cookieStore = await cookies()
  const cookie = cookieStore.get(COOKIE_NAME)
  if (cookie?.value) return { token: cookie.value, source: 'cookie' }

  return null
}

/**
 * Authenticate request via Bearer token or session cookie
 */
export async function authenticateRequest(
  request?: NextRequest
): Promise<AuthResult | null> {
  const authToken = await getAuthToken(request)
  if (!authToken) return null

  const user = await validateSession(authToken.token)
  if (!user) return null

  return { user, token: authToken.token, source: authToken.source }
}
