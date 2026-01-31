import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createInjectionSchema } from '@/lib/validations/injection'
import { getNextDoseNumber } from '@/lib/dose-tracking'
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

    // Calculate dose number if not provided
    let doseNumber = validated.doseNumber
    if (doseNumber == null) {
      const lastInjection = await prisma.injection.findFirst({
        where: { userId },
        orderBy: { date: 'desc' },
        select: { doseNumber: true },
      })
      doseNumber = getNextDoseNumber(lastInjection?.doseNumber ?? null)
    }

    // Create the injection record
    const injection = await prisma.injection.create({
      data: {
        userId,
        site: validated.site,
        doseNumber,
        dosageMg: validated.dosageMg ?? null,
        notes: validated.notes,
        date: injectionDate,
      },
    })

    // If dosageMg is provided and differs from user's currentDosage, update it (titration)
    if (validated.dosageMg != null) {
      const currentDosageNum = user.currentDosage ? Number(user.currentDosage) : null
      if (currentDosageNum !== validated.dosageMg) {
        await prisma.user.update({
          where: { id: userId },
          data: { currentDosage: validated.dosageMg },
        })
      }
    }

    return NextResponse.json(injection, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Failed to create injection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
