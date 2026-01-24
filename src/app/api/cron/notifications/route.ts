import { NextRequest, NextResponse } from 'next/server'
import {
  checkAndSendInjectionReminders,
  checkAndSendWeighInReminders,
  checkAndSendHabitReminders,
} from '@/lib/services/notification-service'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  try {
    // Verify CRON_SECRET header
    const authHeader = request.headers.get('authorization')
    const providedSecret = authHeader?.replace('Bearer ', '')

    if (!CRON_SECRET) {
      console.error('CRON_SECRET environment variable is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (providedSecret !== CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Send all notifications
    const results = {
      injectionReminders: 0,
      weighInReminders: 0,
      habitReminders: 0,
      errors: [] as string[],
    }

    try {
      results.injectionReminders = await checkAndSendInjectionReminders()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      results.errors.push(`Injection reminders failed: ${message}`)
      console.error('Failed to send injection reminders:', error)
    }

    try {
      results.weighInReminders = await checkAndSendWeighInReminders()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      results.errors.push(`Weigh-in reminders failed: ${message}`)
      console.error('Failed to send weigh-in reminders:', error)
    }

    try {
      results.habitReminders = await checkAndSendHabitReminders()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      results.errors.push(`Habit reminders failed: ${message}`)
      console.error('Failed to send habit reminders:', error)
    }

    const totalSent =
      results.injectionReminders +
      results.weighInReminders +
      results.habitReminders

    return NextResponse.json({
      success: true,
      totalEmailsSent: totalSent,
      breakdown: {
        injectionReminders: results.injectionReminders,
        weighInReminders: results.weighInReminders,
        habitReminders: results.habitReminders,
      },
      errors: results.errors.length > 0 ? results.errors : undefined,
    })
  } catch (error) {
    console.error('Cron job failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
