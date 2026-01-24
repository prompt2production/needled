import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    const userId = verifyUnsubscribeToken(token)

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    // Set all notification preferences to false
    await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        injectionReminder: false,
        weighInReminder: false,
        habitReminder: false,
        reminderTime: '09:00',
        habitReminderTime: '20:00',
        timezone: 'Europe/London',
      },
      update: {
        injectionReminder: false,
        weighInReminder: false,
        habitReminder: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'You have been unsubscribed from all Needled email notifications.',
    })
  } catch (error) {
    console.error('Failed to unsubscribe:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
