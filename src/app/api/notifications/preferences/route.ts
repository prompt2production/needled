import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/api-auth'
import { notificationPreferencesInputSchema } from '@/lib/validations/notification-preferences'
import { z } from 'zod'

const DEFAULT_PREFERENCES = {
  injectionReminder: true,
  weighInReminder: true,
  habitReminder: false,
  reminderTime: '09:00',
  habitReminderTime: '20:00',
  timezone: 'Europe/London',
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Try to find existing preferences
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId: auth.user.id },
    })

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId: auth.user.id,
          ...DEFAULT_PREFERENCES,
        },
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Failed to fetch notification preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = notificationPreferencesInputSchema.parse(body)

    // Upsert preferences - create if doesn't exist, update if exists
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: auth.user.id },
      create: {
        userId: auth.user.id,
        ...validated,
      },
      update: validated,
    })

    return NextResponse.json(preferences)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Failed to update notification preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
