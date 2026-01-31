import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Only return the authenticated user's data (ignore the [id] param for security)
    // This prevents enumeration attacks and ensures users can only access their own profile
    const { passwordHash: _, ...userWithoutPassword } = auth.user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
