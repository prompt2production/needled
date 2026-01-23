import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'
import { getSessionToken, clearSessionCookie } from '@/lib/cookies'

export async function POST() {
  try {
    // Get the current session token
    const token = await getSessionToken()

    // Delete session from database if it exists
    if (token) {
      await deleteSession(token)
    }

    // Clear the session cookie
    await clearSessionCookie()

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
