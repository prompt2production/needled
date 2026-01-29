import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, hashPassword } from '@/lib/auth'
import { authenticateRequest } from '@/lib/api-auth'
import { passwordUpdateSchema } from '@/lib/validations/settings'
import { z } from 'zod'

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = passwordUpdateSchema.parse(body)

    // Verify current password
    if (!auth.user.passwordHash) {
      return NextResponse.json(
        { error: 'Password not set for this account' },
        { status: 400 }
      )
    }

    const isCurrentPasswordValid = await verifyPassword(
      validated.currentPassword,
      auth.user.passwordHash
    )

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash new password and update
    const newPasswordHash = await hashPassword(validated.newPassword)

    await prisma.user.update({
      where: { id: auth.user.id },
      data: { passwordHash: newPasswordHash },
    })

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Password update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
