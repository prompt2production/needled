import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const whereClause: {
      userId: string
      date?: { gte?: Date; lte?: Date }
    } = { userId }

    if (startDate || endDate) {
      whereClause.date = {}
      if (startDate) {
        whereClause.date.gte = new Date(startDate)
      }
      if (endDate) {
        // Add one day to include the end date in the range
        const end = new Date(endDate)
        end.setDate(end.getDate() + 1)
        whereClause.date.lte = end
      }
    }

    const habits = await prisma.dailyHabit.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(habits)
  } catch (error) {
    console.error('Failed to fetch habits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
