import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createWeighInSchema } from '@/lib/validations/weigh-in'
import { authenticateRequest } from '@/lib/api-auth'
import { z } from 'zod'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10),
      MAX_LIMIT
    )
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const weighIns = await prisma.weighIn.findMany({
      where: { userId: auth.user.id },
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
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createWeighInSchema.parse(body)

    // Use provided date or default to current date
    const weighInDate = validated.date
      ? new Date(validated.date + 'T12:00:00Z') // Noon UTC to avoid timezone issues
      : new Date()

    const weighIn = await prisma.weighIn.create({
      data: {
        userId: auth.user.id,
        weight: validated.weight,
        date: weighInDate,
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
