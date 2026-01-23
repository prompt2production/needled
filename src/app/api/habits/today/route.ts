import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { toggleHabitSchema } from '@/lib/validations/habit'
import { getDateString } from '@/lib/habit-dates'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

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
    const body = await request.json()
    const validated = toggleHabitSchema.parse(body)

    const today = new Date()
    const todayString = getDateString(today)

    // Upsert: create if doesn't exist, update if does
    const habit = await prisma.dailyHabit.upsert({
      where: {
        userId_date: {
          userId: validated.userId,
          date: new Date(todayString),
        },
      },
      create: {
        userId: validated.userId,
        date: new Date(todayString),
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
