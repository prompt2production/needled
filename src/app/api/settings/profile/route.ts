import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/api-auth'
import { profileUpdateSchema } from '@/lib/validations/settings'
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
    const validated = profileUpdateSchema.parse(body)

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        name: validated.name,
        goalWeight: validated.goalWeight,
        medication: validated.medication,
        injectionDay: validated.injectionDay,
        currentDosage: validated.currentDosage,
        height: validated.height,
      },
      select: {
        id: true,
        name: true,
        email: true,
        goalWeight: true,
        weightUnit: true,
        medication: true,
        injectionDay: true,
        currentDosage: true,
        height: true,
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
