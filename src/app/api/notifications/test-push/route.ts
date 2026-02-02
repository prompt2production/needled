import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import {
  sendPushNotification,
  pushNotificationTemplates,
} from '@/lib/services/push-notification-service'
import { z } from 'zod'

const testPushSchema = z.object({
  type: z.enum(['injection', 'weighIn', 'habit', 'test']).optional().default('test'),
})

/**
 * POST /api/notifications/test-push
 * Send a test push notification to the authenticated user's registered device
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { user } = auth

    if (!user.expoPushToken) {
      return NextResponse.json(
        { error: 'No push token registered. Please enable push notifications in the app first.' },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { type } = testPushSchema.parse(body)

    const template = pushNotificationTemplates[type]
    const result = await sendPushNotification(user.expoPushToken, {
      ...template,
      title: type === 'test' ? template.title : `[TEST] ${template.title}`,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: `Failed to send test push notification: ${result.error}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Test push notification sent to your ${user.pushTokenPlatform || 'device'}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Failed to send test push notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
