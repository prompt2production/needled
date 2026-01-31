import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  calendarMonthParamsSchema,
  type CalendarMonthResponse,
} from '@/lib/validations/calendar'
import { authenticateRequest } from '@/lib/api-auth'
import { z } from 'zod'
import { startOfMonth, endOfMonth } from 'date-fns'

interface RouteParams {
  params: Promise<{
    year: string
    month: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = auth.user.id
    const { year, month } = await params

    // Validate year and month parameters
    const validated = calendarMonthParamsSchema.parse({
      year,
      month,
    })

    // Calculate date range for the month
    const monthDate = new Date(validated.year, validated.month - 1, 1)
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)

    // Query habits for the month
    const habits = await prisma.dailyHabit.findMany({
      where: {
        userId,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        date: true,
        water: true,
        nutrition: true,
        exercise: true,
      },
      orderBy: { date: 'asc' },
    })

    // Query weigh-ins for the month
    const weighIns = await prisma.weighIn.findMany({
      where: {
        userId,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        date: true,
        weight: true,
      },
      orderBy: { date: 'asc' },
    })

    // Query injections for the month
    const injections = await prisma.injection.findMany({
      where: {
        userId,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        date: true,
        site: true,
      },
      orderBy: { date: 'asc' },
    })

    const response: CalendarMonthResponse = {
      habits: habits.map((h) => ({
        date: h.date.toISOString().split('T')[0],
        water: h.water,
        nutrition: h.nutrition,
        exercise: h.exercise,
      })),
      weighIns: weighIns.map((w) => ({
        date: w.date.toISOString().split('T')[0],
        weight: w.weight,
      })),
      injections: injections.map((i) => ({
        date: i.date.toISOString().split('T')[0],
        site: i.site,
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Failed to fetch calendar month:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
