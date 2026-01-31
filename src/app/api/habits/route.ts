import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = auth.user.id
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

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
