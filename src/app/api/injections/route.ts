import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createInjectionSchema } from '@/lib/validations/injection'
import { getNextDoseNumber, isGoldenDoseAvailable, type DoseTrackingConfig } from '@/lib/dose-tracking'
import { authenticateRequest } from '@/lib/api-auth'
import { z } from 'zod'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10),
      MAX_LIMIT
    )
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const injections = await prisma.injection.findMany({
      where: { userId: auth.user.id },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    })

    return NextResponse.json(injections)
  } catch (error) {
    console.error('Failed to fetch injections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = auth.user.id
    const body = await request.json()
    const validated = createInjectionSchema.parse(body)

    // Get user to validate they exist
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Use provided date or default to current date
    const injectionDate = validated.date
      ? new Date(validated.date + 'T12:00:00Z') // Noon UTC to avoid timezone issues
      : new Date()

    // Build dose tracking config from user settings
    const doseConfig: DoseTrackingConfig = {
      dosesPerPen: user.dosesPerPen,
      tracksGoldenDose: user.tracksGoldenDose,
    }

    // Get last injection to calculate next dose
    const lastInjection = await prisma.injection.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { doseNumber: true, isGoldenDose: true },
    })

    // Determine if this is a golden dose
    const isGoldenDose = validated.isGoldenDose ?? false

    // Validate golden dose eligibility
    if (isGoldenDose) {
      if (!user.tracksGoldenDose) {
        return NextResponse.json(
          { error: 'Golden dose tracking is not enabled for this user' },
          { status: 400 }
        )
      }
      const goldenAvailable = isGoldenDoseAvailable(lastInjection?.doseNumber ?? null, doseConfig)
      if (!goldenAvailable) {
        return NextResponse.json(
          { error: 'Golden dose is not available - all standard doses must be taken first' },
          { status: 400 }
        )
      }
    }

    // Calculate dose number if not provided
    let doseNumber = validated.doseNumber
    if (doseNumber == null) {
      // If marking as golden dose, set dose number to dosesPerPen + 1
      if (isGoldenDose) {
        doseNumber = user.dosesPerPen + 1
      } else {
        const configWithGoldenState: DoseTrackingConfig = {
          ...doseConfig,
          wasGoldenDose: lastInjection?.isGoldenDose ?? false,
        }
        doseNumber = getNextDoseNumber(lastInjection?.doseNumber ?? null, configWithGoldenState)
      }
    }

    // Create the injection record
    const injection = await prisma.injection.create({
      data: {
        userId,
        site: validated.site,
        doseNumber,
        dosageMg: validated.dosageMg ?? null,
        isGoldenDose,
        notes: validated.notes,
        date: injectionDate,
      },
    })

    // Calculate the new currentDoseInPen and update user
    let newCurrentDoseInPen: number
    if (isGoldenDose) {
      // After golden dose, reset to 1 (new pen)
      newCurrentDoseInPen = 1
    } else if (doseNumber >= user.dosesPerPen && !user.tracksGoldenDose) {
      // Last standard dose without golden tracking, reset to 1 (new pen)
      newCurrentDoseInPen = 1
    } else {
      // Normal progression within pen
      newCurrentDoseInPen = doseNumber
    }

    // Build user update data
    const userUpdateData: { currentDosage?: number; currentDoseInPen: number } = {
      currentDoseInPen: newCurrentDoseInPen,
    }

    // If dosageMg is provided and differs from user's currentDosage, update it (titration)
    if (validated.dosageMg != null) {
      const currentDosageNum = user.currentDosage ? Number(user.currentDosage) : null
      if (currentDosageNum !== validated.dosageMg) {
        userUpdateData.currentDosage = validated.dosageMg
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
    })

    return NextResponse.json(injection, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Failed to create injection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
