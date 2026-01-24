import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, verifyPassword } from '@/lib/auth'
import { getSessionToken, clearSessionCookie } from '@/lib/cookies'
import { accountDeleteSchema } from '@/lib/validations/settings'
import { z } from 'zod'

export async function DELETE(request: NextRequest) {
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

    const body = await request.json()
    const validated = accountDeleteSchema.parse(body)

    // Verify password before deletion
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Password not set for this account' },
        { status: 400 }
      )
    }

    const isPasswordValid = await verifyPassword(
      validated.password,
      user.passwordHash
    )

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 400 }
      )
    }

    // Delete user (cascades to all related data due to onDelete: Cascade in schema)
    await prisma.user.delete({
      where: { id: user.id },
    })

    // Clear session cookie
    await clearSessionCookie()

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
