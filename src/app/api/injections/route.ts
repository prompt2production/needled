import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createInjectionSchema } from '@/lib/validations/injection'
import { getInjectionWeekStart, getInjectionWeekEnd } from '@/lib/injection-week'
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

    const injections = await prisma.injection.findMany({
      where: { userId },
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
    const body = await request.json()
    const validated = createInjectionSchema.parse(body)

    // Get user to find their injection day
    const user = await prisma.user.findUnique({
      where: { id: validated.userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has already logged an injection this injection week
    const now = new Date()
    const weekStart = getInjectionWeekStart(now, user.injectionDay)
    const weekEnd = getInjectionWeekEnd(now, user.injectionDay)

    const existingInjection = await prisma.injection.findFirst({
      where: {
        userId: validated.userId,
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    })

    if (existingInjection) {
      return NextResponse.json(
        { error: 'You have already logged an injection this week' },
        { status: 409 }
      )
    }

    const injection = await prisma.injection.create({
      data: {
        userId: validated.userId,
        site: validated.site,
        notes: validated.notes,
        date: now,
      },
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
