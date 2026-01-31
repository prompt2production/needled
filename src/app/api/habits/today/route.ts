import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { toggleHabitSchema } from '@/lib/validations/habit'
import { getDateString } from '@/lib/habit-dates'
import { authenticateRequest } from '@/lib/api-auth'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = auth.user.id
    const today = new Date()
    const todayString = getDateString(today)

    // Try to find existing habit for today
    let habit = await prisma.dailyHabit.findUnique({
      where: {
        userId_date: {
          userId,
          date: new Date(todayString),
        },
      },
    })

    // If no habit exists, create one with all habits false
    if (!habit) {
      habit = await prisma.dailyHabit.create({
        data: {
          userId,
          date: new Date(todayString),
          water: false,
          nutrition: false,
          exercise: false,
        },
      })
    }

    return NextResponse.json(habit)
  } catch (error) {
    console.error('Failed to fetch today\'s habits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = auth.user.id
    const body = await request.json()
    const validated = toggleHabitSchema.parse(body)

    // Use provided date or default to today
    const todayString = getDateString(new Date())
    const targetDate = validated.date || todayString

    // Only validate if a specific date was provided (not defaulting to today)
    if (validated.date) {
      const targetDateObj = new Date(targetDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      targetDateObj.setHours(0, 0, 0, 0)

      if (targetDateObj > today) {
        return NextResponse.json({ error: 'Cannot log habits for future dates' }, { status: 400 })
      }

      const ninetyDaysAgo = new Date(today)
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
      if (targetDateObj < ninetyDaysAgo) {
        return NextResponse.json({ error: 'Cannot log habits for dates more than 90 days ago' }, { status: 400 })
      }
    }

    // Upsert: create if doesn't exist, update if does
    const habit = await prisma.dailyHabit.upsert({
      where: {
        userId_date: {
          userId,
          date: new Date(targetDate),
        },
      },
      create: {
        userId,
        date: new Date(targetDate),
        water: validated.habit === 'water' ? validated.value : false,
        nutrition: validated.habit === 'nutrition' ? validated.value : false,
        exercise: validated.habit === 'exercise' ? validated.value : false,
      },
      update: {
        [validated.habit]: validated.value,
      },
    })

    return NextResponse.json(habit)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Failed to toggle habit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
