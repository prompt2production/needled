import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createUserSchema } from '@/lib/validations/user'
import { hashPassword, createSession } from '@/lib/auth'
import { setSessionCookie } from '@/lib/cookies'
import { sendEmail } from '@/lib/email'
import { renderWelcomeEmail, getWelcomeEmailSubject } from '@/lib/email-templates/welcome'
import { generateUnsubscribeToken } from '@/lib/unsubscribe-token'
import { calculateDosesPerPen } from '@/lib/dose-tracking'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function getMedicationDisplayName(medication: string): string {
  const names: Record<string, string> = {
    OZEMPIC: 'Ozempic',
    WEGOVY: 'Wegovy',
    MOUNJARO: 'Mounjaro',
    ZEPBOUND: 'Zepbound',
    OTHER: 'your medication',
  }
  return names[medication] || 'your medication'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createUserSchema.parse(body)

    // Hash the password
    const passwordHash = await hashPassword(validated.password)

    // Calculate dosesPerPen for microdosers
    const dosesPerPen = validated.dosingMode === 'MICRODOSE' && validated.penStrengthMg && validated.doseAmountMg
      ? calculateDosesPerPen(validated.penStrengthMg, validated.doseAmountMg)
      : validated.dosesPerPen ?? 4

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
        dosingMode: validated.dosingMode ?? 'STANDARD',
        penStrengthMg: validated.penStrengthMg ?? null,
        doseAmountMg: validated.doseAmountMg ?? null,
        dosesPerPen,
        tracksGoldenDose: validated.tracksGoldenDose ?? false,
        currentDoseInPen: validated.currentDoseInPen ?? 1,
      },
    })

    // Create session and set cookie
    const token = await createSession(user.id)
    await setSessionCookie(token)

    // Send welcome email (non-blocking, don't fail registration if email fails)
    if (user.email) {
      try {
        const unsubscribeToken = generateUnsubscribeToken(user.id)
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://needled.app'}/unsubscribe?token=${unsubscribeToken}`

        const html = renderWelcomeEmail({
          userName: user.name,
          medication: getMedicationDisplayName(user.medication),
          injectionDay: DAYS_OF_WEEK[user.injectionDay],
          unsubscribeUrl,
        })

        await sendEmail({
          to: user.email,
          subject: getWelcomeEmailSubject(user.name),
          html,
        })
      } catch (emailError) {
        // Log but don't fail registration if email sending fails
        console.error('Failed to send welcome email:', emailError)
      }
    }

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
