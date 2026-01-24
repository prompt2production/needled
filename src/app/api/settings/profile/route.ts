import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession } from '@/lib/auth'
import { getSessionToken } from '@/lib/cookies'
import { profileUpdateSchema } from '@/lib/validations/settings'
import { z } from 'zod'

export async function PUT(request: NextRequest) {
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
    const validated = profileUpdateSchema.parse(body)

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: validated.name,
        goalWeight: validated.goalWeight,
        medication: validated.medication,
        injectionDay: validated.injectionDay,
      },
      select: {
        id: true,
        name: true,
        email: true,
        goalWeight: true,
        weightUnit: true,
        medication: true,
        injectionDay: true,
        // Explicitly NOT selecting passwordHash
      },
    })

    return NextResponse.json(updatedUser, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
