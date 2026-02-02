import { prisma } from '@/lib/prisma'

const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send'

export interface PushNotificationPayload {
  title: string
  body: string
  data?: Record<string, string>
  sound?: 'default' | null
  priority?: 'default' | 'normal' | 'high'
  channelId?: string
}

interface ExpoPushResponse {
  data: Array<{
    status: 'ok' | 'error'
    id?: string
    message?: string
    details?: {
      error?: 'DeviceNotRegistered' | 'MessageTooBig' | 'MessageRateExceeded' | 'InvalidCredentials'
    }
  }>
}

/**
 * Send a push notification to a single device via Expo Push API
 */
export async function sendPushNotification(
  token: string,
  payload: PushNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(EXPO_PUSH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        ...payload,
      }),
    })

    if (!response.ok) {
      console.error(`Expo Push API error: ${response.status} ${response.statusText}`)
      return { success: false, error: `HTTP ${response.status}` }
    }

    const result: ExpoPushResponse = await response.json()
    const ticket = result.data?.[0]

    if (ticket?.status === 'error') {
      const errorCode = ticket.details?.error

      // Handle invalid/expired tokens by removing them from the database
      if (errorCode === 'DeviceNotRegistered') {
        console.log(`Removing invalid push token: ${token}`)
        await removeInvalidPushToken(token)
      }

      return { success: false, error: errorCode || ticket.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to send push notification:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Send push notifications to multiple devices in a batch (up to 100)
 */
export async function sendPushNotificationBatch(
  notifications: Array<{ token: string; payload: PushNotificationPayload }>
): Promise<{ sent: number; failed: number }> {
  if (notifications.length === 0) {
    return { sent: 0, failed: 0 }
  }

  // Expo allows up to 100 notifications per request
  const batches: Array<Array<{ token: string; payload: PushNotificationPayload }>> = []
  for (let i = 0; i < notifications.length; i += 100) {
    batches.push(notifications.slice(i, i + 100))
  }

  let sent = 0
  let failed = 0
  const tokensToRemove: string[] = []

  for (const batch of batches) {
    try {
      const messages = batch.map(({ token, payload }) => ({
        to: token,
        ...payload,
      }))

      const response = await fetch(EXPO_PUSH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      })

      if (!response.ok) {
        console.error(`Expo Push API batch error: ${response.status}`)
        failed += batch.length
        continue
      }

      const result: ExpoPushResponse = await response.json()

      for (let i = 0; i < result.data.length; i++) {
        const ticket = result.data[i]
        if (ticket.status === 'ok') {
          sent++
        } else {
          failed++
          if (ticket.details?.error === 'DeviceNotRegistered') {
            tokensToRemove.push(batch[i].token)
          }
        }
      }
    } catch (error) {
      console.error('Failed to send push notification batch:', error)
      failed += batch.length
    }
  }

  // Clean up invalid tokens
  for (const token of tokensToRemove) {
    await removeInvalidPushToken(token)
  }

  return { sent, failed }
}

/**
 * Remove an invalid push token from the database
 */
async function removeInvalidPushToken(token: string): Promise<void> {
  try {
    await prisma.user.updateMany({
      where: { expoPushToken: token },
      data: {
        expoPushToken: null,
        pushTokenPlatform: null,
        pushTokenUpdatedAt: null,
      },
    })
  } catch (error) {
    console.error(`Failed to remove invalid push token: ${token}`, error)
  }
}

/**
 * Notification templates for different reminder types
 */
export const pushNotificationTemplates = {
  injection: {
    title: "Time for your injection! 💉",
    body: "Pip is here to remind you it's injection day. You've got this!",
    data: { type: 'injection', screen: '/(tabs)/injection' },
    sound: 'default' as const,
    priority: 'high' as const,
    channelId: 'injection-reminders',
  },
  weighIn: {
    title: "Weekly weigh-in time! ⚖️",
    body: "Track your progress with a quick weigh-in.",
    data: { type: 'weighin', screen: '/(tabs)/weigh-in' },
    sound: 'default' as const,
    priority: 'default' as const,
    channelId: 'weighin-reminders',
  },
  habit: {
    title: "Don't forget your habits! 🌟",
    body: "Have you logged your water, nutrition, and exercise today?",
    data: { type: 'habits', screen: '/(tabs)/check-in' },
    sound: 'default' as const,
    priority: 'default' as const,
    channelId: 'habit-reminders',
  },
  test: {
    title: "Test notification 🔔",
    body: "Push notifications are working!",
    data: { type: 'test', screen: '/(tabs)' },
    sound: 'default' as const,
    priority: 'high' as const,
    channelId: 'default',
  },
}
