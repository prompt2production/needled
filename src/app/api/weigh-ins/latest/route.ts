import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWeekStart, getWeekEnd } from '@/lib/week'

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

    // Get user to access startWeight
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { startWeight: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get the latest two weigh-ins to calculate week change
    const recentWeighIns = await prisma.weighIn.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 2,
    })

    // Check if user can weigh in this week
    const now = new Date()
    const weekStart = getWeekStart(now)
    const weekEnd = getWeekEnd(now)

    const thisWeekWeighIn = await prisma.weighIn.findFirst({
      where: {
        userId,
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    })

    const canWeighIn = !thisWeekWeighIn

    // No weigh-in history
    if (recentWeighIns.length === 0) {
      return NextResponse.json({
        weighIn: null,
        weekChange: null,
        totalChange: null,
        canWeighIn,
      })
    }

    const latestWeighIn = recentWeighIns[0]
    const previousWeighIn = recentWeighIns.length > 1 ? recentWeighIns[1] : null

    const weekChange = previousWeighIn
      ? Number((latestWeighIn.weight - previousWeighIn.weight).toFixed(1))
      : null

    const totalChange = Number((latestWeighIn.weight - user.startWeight).toFixed(1))

    return NextResponse.json({
      weighIn: {
        id: latestWeighIn.id,
        weight: latestWeighIn.weight,
        date: latestWeighIn.date,
      },
      weekChange,
      totalChange,
      canWeighIn,
    })
  } catch (error) {
    console.error('Failed to fetch latest weigh-in:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
