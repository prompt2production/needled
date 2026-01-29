import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { clearSessionCookie } from '@/lib/cookies'
import { authenticateRequest, getAuthToken } from '@/lib/api-auth'
import { accountDeleteSchema } from '@/lib/validations/settings'
import { z } from 'zod'

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = accountDeleteSchema.parse(body)

    // Verify password before deletion
    if (!auth.user.passwordHash) {
      return NextResponse.json(
        { error: 'Password not set for this account' },
        { status: 400 }
      )
    }

    const isPasswordValid = await verifyPassword(
      validated.password,
      auth.user.passwordHash
    )

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 400 }
      )
    }

    // Delete user (cascades to all related data due to onDelete: Cascade in schema)
    await prisma.user.delete({
      where: { id: auth.user.id },
    })

    // Only clear cookie if using cookie auth
    const authToken = await getAuthToken(request)
    if (!authToken || authToken.source === 'cookie') {
      await clearSessionCookie()
    }

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
