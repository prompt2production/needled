import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'
import { clearSessionCookie } from '@/lib/cookies'
import { getAuthToken } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    // Get the current session token from Bearer header or cookie
    const authToken = await getAuthToken(request)

    // Delete session from database if it exists
    if (authToken) {
      await deleteSession(authToken.token)
    }

    // Only clear cookie if using cookie auth (Bearer users have no cookie to clear)
    if (!authToken || authToken.source === 'cookie') {
      await clearSessionCookie()
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Logout error:', error)
    // Even on error, try to clear the cookie and return success
    // This ensures the user can always log out
    try {
      await clearSessionCookie()
    } catch {
      // Ignore cookie clearing errors
    }
    return NextResponse.json({ success: true }, { status: 200 })
  }
}
