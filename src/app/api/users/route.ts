import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createUserSchema } from '@/lib/validations/user'
import { hashPassword, createSession } from '@/lib/auth'
import { setSessionCookie } from '@/lib/cookies'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createUserSchema.parse(body)

    // Hash the password
    const passwordHash = await hashPassword(validated.password)

    // Create the user with hashed password
    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        passwordHash,
        startWeight: validated.startWeight,
        goalWeight: validated.goalWeight ?? null,
        weightUnit: validated.weightUnit,
        medication: validated.medication,
        injectionDay: validated.injectionDay,
        currentDosage: validated.startingDosage ?? null,
        height: validated.height ?? null,
      },
    })

    // Create session and set cookie
    const token = await createSession(user.id)
    await setSessionCookie(token)

    // Return user data without passwordHash
    const { passwordHash: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 is the unique constraint violation error code
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        )
      }
    }
    console.error('Failed to create user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
