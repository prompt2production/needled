import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  calendarDayParamsSchema,
  type CalendarDayResponse,
} from '@/lib/validations/calendar'
import { z } from 'zod'
import { startOfDay, endOfDay } from 'date-fns'

interface RouteParams {
  params: Promise<{
    date: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const { date: dateParam } = await params

    // Validate date parameter
    const validated = calendarDayParamsSchema.parse({ date: dateParam })

    const date = new Date(validated.date)
    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)

    // Query habit for the specific date
    const habit = await prisma.dailyHabit.findFirst({
      where: {
        userId,
        date: dayStart,
      },
      select: {
        water: true,
        nutrition: true,
        exercise: true,
      },
    })

    // Query weigh-in for the specific date
    const weighIn = await prisma.weighIn.findFirst({
      where: {
        userId,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      select: {
        weight: true,
        date: true,
      },
    })

    // If weigh-in exists, fetch the previous weigh-in to calculate change
    let weighInChange: number | null = null
    if (weighIn) {
      const previousWeighIn = await prisma.weighIn.findFirst({
        where: {
          userId,
          date: {
            lt: dayStart,
          },
        },
        orderBy: {
          date: 'desc',
        },
        select: {
          weight: true,
        },
      })

      if (previousWeighIn) {
        weighInChange = weighIn.weight - previousWeighIn.weight
      }
    }

    // Query injection for the specific date
    const injection = await prisma.injection.findFirst({
      where: {
        userId,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      select: {
        site: true,
      },
    })

    const response: CalendarDayResponse = {
      date: validated.date,
      habit: habit
        ? {
            water: habit.water,
            nutrition: habit.nutrition,
            exercise: habit.exercise,
          }
        : null,
      weighIn: weighIn
        ? {
            weight: weighIn.weight,
            change: weighInChange,
          }
        : null,
      injection: injection
        ? {
            site: injection.site,
          }
        : null,
    }

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Failed to fetch calendar day:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
