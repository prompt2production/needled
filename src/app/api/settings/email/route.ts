import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession } from '@/lib/auth'
import { getSessionToken } from '@/lib/cookies'
import { emailUpdateSchema } from '@/lib/validations/settings'
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
    const validated = emailUpdateSchema.parse(body)

    // Check if email is already in use by another user
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      )
    }

    // Update user email
    await prisma.user.update({
      where: { id: user.id },
      data: { email: validated.email },
    })

    return NextResponse.json(
      { message: 'Email updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Email update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
