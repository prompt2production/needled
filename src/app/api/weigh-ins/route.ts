import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createWeighInSchema } from '@/lib/validations/weigh-in'
import { getWeekStart, getWeekEnd } from '@/lib/week'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createWeighInSchema.parse(body)

    // Check if user has already weighed in this week
    const now = new Date()
    const weekStart = getWeekStart(now)
    const weekEnd = getWeekEnd(now)

    const existingWeighIn = await prisma.weighIn.findFirst({
      where: {
        userId: validated.userId,
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    })

    if (existingWeighIn) {
      return NextResponse.json(
        { error: 'You have already logged a weigh-in this week' },
        { status: 409 }
      )
    }

    const weighIn = await prisma.weighIn.create({
      data: {
        userId: validated.userId,
        weight: validated.weight,
        date: now,
      },
    })

    return NextResponse.json(weighIn, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Failed to create weigh-in:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
