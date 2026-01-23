import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createWeighInSchema } from '@/lib/validations/weigh-in'
import { getWeekStart, getWeekEnd } from '@/lib/week'
import { z } from 'zod'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = Math.min(
      parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10),
      MAX_LIMIT
    )
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const weighIns = await prisma.weighIn.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    })

    return NextResponse.json(weighIns)
  } catch (error) {
    console.error('Failed to fetch weigh-ins:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
