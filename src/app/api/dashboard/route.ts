import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { dashboardQuerySchema, type DashboardResponse } from '@/lib/validations/dashboard'
import { getWeekStart, getWeekEnd } from '@/lib/week'
import { differenceInWeeks, startOfWeek, eachDayOfInterval, isToday, isBefore, startOfDay } from 'date-fns'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Validate query params
    const validated = dashboardQuerySchema.parse({ userId })

    // Fetch user with related data
    const user = await prisma.user.findUnique({
      where: { id: validated.userId },
      include: {
        weighIns: {
          orderBy: { date: 'desc' },
          take: 2, // Get current and previous for week change
        },
        dailyHabits: {
          where: {
            date: {
              gte: getWeekStart(new Date()),
              lte: getWeekEnd(new Date()),
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all weigh-ins count
    const weighInCount = await prisma.weighIn.count({
      where: { userId: validated.userId },
    })

    // Calculate weight data
    const currentWeighIn = user.weighIns[0] || null
    const previousWeighIn = user.weighIns[1] || null
    const currentWeight = currentWeighIn?.weight ?? null
    const previousWeight = previousWeighIn?.weight ?? null
    const weekChange = currentWeight != null && previousWeight != null
      ? currentWeight - previousWeight
      : null
    const totalLost = currentWeight != null
      ? user.startWeight - currentWeight
      : null

    // Calculate progress percentage toward goal
    let progressPercent: number | null = null
    if (user.goalWeight != null) {
      if (currentWeight == null) {
        progressPercent = 0
      } else {
        const totalToLose = user.startWeight - user.goalWeight
        const lost = user.startWeight - currentWeight
        progressPercent = Math.min(100, Math.max(0, (lost / totalToLose) * 100))
      }
    }

    // Check if user can weigh in this week
    const now = new Date()
    const weekStart = getWeekStart(now)
    const weekEnd = getWeekEnd(now)
    const hasWeighedInThisWeek = currentWeighIn
      ? currentWeighIn.date >= weekStart && currentWeighIn.date <= weekEnd
      : false
    const canWeighIn = !hasWeighedInThisWeek

    // Calculate journey week number
    const userStartWeek = startOfWeek(user.createdAt, { weekStartsOn: 1 })
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekNumber = differenceInWeeks(currentWeekStart, userStartWeek) + 1

    // Calculate weekly habit completion
    const daysInWeekSoFar = eachDayOfInterval({
      start: weekStart,
      end: now,
    }).filter(day => isBefore(day, now) || isToday(day))

    const totalPossibleHabits = daysInWeekSoFar.length * 3 // 3 habits per day
    let completedHabits = 0

    for (const habit of user.dailyHabits) {
      if (habit.water) completedHabits++
      if (habit.nutrition) completedHabits++
      if (habit.exercise) completedHabits++
    }

    const weeklyCompletionPercent = totalPossibleHabits > 0
      ? Math.round((completedHabits / totalPossibleHabits) * 100)
      : 0

    // Calculate today's habit completion
    const todayStart = startOfDay(now)
    const todayHabit = user.dailyHabits.find(
      h => h.date.getTime() === todayStart.getTime()
    )
    const todayCompleted = todayHabit
      ? (todayHabit.water ? 1 : 0) + (todayHabit.nutrition ? 1 : 0) + (todayHabit.exercise ? 1 : 0)
      : 0

    const response: DashboardResponse = {
      user: {
        id: user.id,
        name: user.name,
        startWeight: user.startWeight,
        goalWeight: user.goalWeight,
        weightUnit: user.weightUnit,
        medication: user.medication,
        createdAt: user.createdAt.toISOString(),
      },
      weight: {
        currentWeight,
        previousWeight,
        weekChange,
        totalLost,
        progressPercent,
        weighInCount,
        canWeighIn,
      },
      habits: {
        weeklyCompletionPercent,
        todayCompleted,
        todayTotal: 3,
      },
      journey: {
        weekNumber,
        startDate: user.createdAt.toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Failed to fetch dashboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
