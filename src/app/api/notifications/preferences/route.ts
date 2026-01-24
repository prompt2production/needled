import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionToken } from '@/lib/cookies'
import { validateSession } from '@/lib/auth'

const DEFAULT_PREFERENCES = {
  injectionReminder: true,
  weighInReminder: true,
  habitReminder: false,
  reminderTime: '09:00',
  habitReminderTime: '20:00',
  timezone: 'Europe/London',
}

export async function GET() {
  try {
    const token = await getSessionToken()

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await validateSession(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Try to find existing preferences
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId: user.id },
    })

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId: user.id,
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
