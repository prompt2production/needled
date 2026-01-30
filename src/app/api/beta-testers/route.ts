import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createBetaTesterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  platform: z.enum(['IOS', 'ANDROID']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createBetaTesterSchema.parse(body)

    // Check if email already exists
    const existing = await prisma.betaTester.findUnique({
      where: { email: validated.email.toLowerCase() },
    })

    if (existing) {
      // If they're signing up for the same platform, just return success
      if (existing.platform === validated.platform) {
        return NextResponse.json(
          { message: 'You are already signed up for the beta program!' },
          { status: 200 }
        )
      }
      // If different platform, update it
      const updated = await prisma.betaTester.update({
        where: { email: validated.email.toLowerCase() },
        data: { platform: validated.platform },
      })
      return NextResponse.json(updated, { status: 200 })
    }

    const betaTester = await prisma.betaTester.create({
      data: {
        email: validated.email.toLowerCase(),
        platform: validated.platform,
      },
    })

    return NextResponse.json(betaTester, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Beta tester signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
