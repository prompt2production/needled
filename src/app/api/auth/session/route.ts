import { NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth'
import { getSessionToken } from '@/lib/cookies'

export async function GET() {
  try {
    const token = await getSessionToken()

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await validateSession(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Return user data without passwordHash
    const { passwordHash: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword, { status: 200 })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
