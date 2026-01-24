import { NextRequest, NextResponse } from 'next/server'
import { getSessionToken } from '@/lib/cookies'
import { validateSession } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import {
  renderInjectionReminder,
  renderWeighInReminder,
  renderHabitReminder,
  getEmailSubject,
} from '@/lib/email-templates'
import { generateUnsubscribeToken } from '@/lib/unsubscribe-token'
import { z } from 'zod'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const testEmailSchema = z.object({
  type: z.enum(['injection', 'weigh-in', 'habit']),
})

export async function POST(request: NextRequest) {
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

    if (!user.email) {
      return NextResponse.json(
        { error: 'Email address is required to send test emails' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { type } = testEmailSchema.parse(body)

    // Generate unsubscribe URL
    const unsubscribeToken = generateUnsubscribeToken(user.id)
    const unsubscribeUrl = `${APP_URL}/unsubscribe?token=${unsubscribeToken}`

    let html: string
    let subject: string

    switch (type) {
      case 'injection':
        html = renderInjectionReminder({
          userName: user.name,
          medication: user.medication,
          unsubscribeUrl,
        })
        subject = `[TEST] ${getEmailSubject('injection-reminder', user.medication)}`
        break
      case 'weigh-in':
        html = renderWeighInReminder({
          userName: user.name,
          unsubscribeUrl,
        })
        subject = `[TEST] ${getEmailSubject('weigh-in-reminder')}`
        break
      case 'habit':
        html = renderHabitReminder({
          userName: user.name,
          unsubscribeUrl,
        })
        subject = `[TEST] ${getEmailSubject('habit-reminder')}`
        break
    }

    const success = await sendEmail({
      to: user.email,
      subject,
      html,
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Test ${type} email sent to ${user.email}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Failed to send test email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
