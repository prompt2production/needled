import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import {
  renderInjectionReminder,
  renderWeighInReminder,
  renderHabitReminder,
  getEmailSubject,
} from '@/lib/email-templates'
import { generateUnsubscribeToken } from '@/lib/unsubscribe-token'
import {
  sendPushNotification,
  pushNotificationTemplates,
} from '@/lib/services/push-notification-service'
import { startOfDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface NotificationResult {
  emailsSent: number
  pushSent: number
}

/**
 * Get current hour in user's timezone
 */
function getCurrentHourInTimezone(timezone: string): number {
  const now = new Date()
  const zonedTime = toZonedTime(now, timezone)
  return zonedTime.getHours()
}

/**
 * Check if the reminder time matches the current hour
 */
function isReminderTime(reminderTime: string, timezone: string): boolean {
  const [hours] = reminderTime.split(':').map(Number)
  const currentHour = getCurrentHourInTimezone(timezone)
  return hours === currentHour
}

/**
 * Get today's day of week (0 = Monday, 6 = Sunday) in user's timezone
 */
function getTodayDayOfWeek(timezone: string): number {
  const now = new Date()
  const zonedTime = toZonedTime(now, timezone)
  // JavaScript: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // Convert to our format: 0 = Monday, 6 = Sunday
  const jsDay = zonedTime.getDay()
  return jsDay === 0 ? 6 : jsDay - 1
}

/**
 * Check and send injection reminders to users whose injection day is today
 * and haven't logged an injection today
 */
export async function checkAndSendInjectionReminders(): Promise<NotificationResult> {
  let emailsSent = 0
  let pushSent = 0

  // Find users with injection reminder enabled (either email or push token)
  const users = await prisma.user.findMany({
    where: {
      notificationPreference: {
        injectionReminder: true,
      },
      OR: [{ email: { not: null } }, { expoPushToken: { not: null } }],
    },
    include: {
      notificationPreference: true,
      injections: {
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
  })

  for (const user of users) {
    try {
      const prefs = user.notificationPreference
      if (!prefs) continue

      // Check if it's the right time
      if (!isReminderTime(prefs.reminderTime, prefs.timezone)) continue

      // Check if today is injection day
      const todayDayOfWeek = getTodayDayOfWeek(prefs.timezone)
      if (todayDayOfWeek !== user.injectionDay) continue

      // Check if already injected today
      const lastInjection = user.injections[0]
      if (lastInjection) {
        const zonedNow = toZonedTime(new Date(), prefs.timezone)
        const zonedInjection = toZonedTime(lastInjection.date, prefs.timezone)
        const todayStart = startOfDay(zonedNow)
        const injectionStart = startOfDay(zonedInjection)
        if (todayStart.getTime() === injectionStart.getTime()) continue
      }

      // Send push notification if token exists
      if (user.expoPushToken) {
        const pushResult = await sendPushNotification(
          user.expoPushToken,
          pushNotificationTemplates.injection
        )
        if (pushResult.success) pushSent++
      }

      // Send email if email exists
      if (user.email) {
        const unsubscribeToken = generateUnsubscribeToken(user.id)
        const unsubscribeUrl = `${APP_URL}/unsubscribe?token=${unsubscribeToken}`

        const html = renderInjectionReminder({
          userName: user.name,
          medication: user.medication,
          unsubscribeUrl,
        })
        const subject = getEmailSubject('injection-reminder', user.medication)

        const success = await sendEmail({ to: user.email, subject, html })
        if (success) emailsSent++
      }
    } catch (error) {
      console.error(`Failed to send injection reminder to user ${user.id}:`, error)
    }
  }

  return { emailsSent, pushSent }
}

/**
 * Check and send weigh-in reminders to users who haven't weighed in this week
 * Sends on Monday only (first day of the week)
 */
export async function checkAndSendWeighInReminders(): Promise<NotificationResult> {
  let emailsSent = 0
  let pushSent = 0

  // Find users with weigh-in reminder enabled (either email or push token)
  const users = await prisma.user.findMany({
    where: {
      notificationPreference: {
        weighInReminder: true,
      },
      OR: [{ email: { not: null } }, { expoPushToken: { not: null } }],
    },
    include: {
      notificationPreference: true,
      weighIns: {
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
  })

  for (const user of users) {
    try {
      const prefs = user.notificationPreference
      if (!prefs) continue

      // Check if it's the right time
      if (!isReminderTime(prefs.reminderTime, prefs.timezone)) continue

      // Only send weigh-in reminders on Monday (day 0)
      const todayDayOfWeek = getTodayDayOfWeek(prefs.timezone)
      if (todayDayOfWeek !== 0) continue

      // Check if already weighed in this week
      const lastWeighIn = user.weighIns[0]
      if (lastWeighIn) {
        const zonedNow = toZonedTime(new Date(), prefs.timezone)
        const zonedWeighIn = toZonedTime(lastWeighIn.date, prefs.timezone)

        const daysSinceWeighIn = Math.floor(
          (zonedNow.getTime() - zonedWeighIn.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysSinceWeighIn < 7) continue
      }

      // Send push notification if token exists
      if (user.expoPushToken) {
        const pushResult = await sendPushNotification(
          user.expoPushToken,
          pushNotificationTemplates.weighIn
        )
        if (pushResult.success) pushSent++
      }

      // Send email if email exists
      if (user.email) {
        const unsubscribeToken = generateUnsubscribeToken(user.id)
        const unsubscribeUrl = `${APP_URL}/unsubscribe?token=${unsubscribeToken}`

        const html = renderWeighInReminder({
          userName: user.name,
          unsubscribeUrl,
        })
        const subject = getEmailSubject('weigh-in-reminder')

        const success = await sendEmail({ to: user.email, subject, html })
        if (success) emailsSent++
      }
    } catch (error) {
      console.error(`Failed to send weigh-in reminder to user ${user.id}:`, error)
    }
  }

  return { emailsSent, pushSent }
}

/**
 * Check and send habit reminders to users who haven't logged habits today
 */
export async function checkAndSendHabitReminders(): Promise<NotificationResult> {
  let emailsSent = 0
  let pushSent = 0

  // Find users with habit reminder enabled (either email or push token)
  const users = await prisma.user.findMany({
    where: {
      notificationPreference: {
        habitReminder: true,
      },
      OR: [{ email: { not: null } }, { expoPushToken: { not: null } }],
    },
    include: {
      notificationPreference: true,
      dailyHabits: {
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
  })

  for (const user of users) {
    try {
      const prefs = user.notificationPreference
      if (!prefs) continue

      // Check if it's the right time (use habitReminderTime)
      if (!isReminderTime(prefs.habitReminderTime, prefs.timezone)) continue

      // Check if already logged habits today
      const lastHabit = user.dailyHabits[0]
      if (lastHabit) {
        const zonedNow = toZonedTime(new Date(), prefs.timezone)
        const zonedHabit = toZonedTime(lastHabit.date, prefs.timezone)
        const todayStart = startOfDay(zonedNow)
        const habitStart = startOfDay(zonedHabit)

        // If logged today and at least one habit is checked, skip
        if (todayStart.getTime() === habitStart.getTime()) {
          if (lastHabit.water || lastHabit.nutrition || lastHabit.exercise) {
            continue
          }
        }
      }

      // Send push notification if token exists
      if (user.expoPushToken) {
        const pushResult = await sendPushNotification(
          user.expoPushToken,
          pushNotificationTemplates.habit
        )
        if (pushResult.success) pushSent++
      }

      // Send email if email exists
      if (user.email) {
        const unsubscribeToken = generateUnsubscribeToken(user.id)
        const unsubscribeUrl = `${APP_URL}/unsubscribe?token=${unsubscribeToken}`

        const html = renderHabitReminder({
          userName: user.name,
          unsubscribeUrl,
        })
        const subject = getEmailSubject('habit-reminder')

        const success = await sendEmail({ to: user.email, subject, html })
        if (success) emailsSent++
      }
    } catch (error) {
      console.error(`Failed to send habit reminder to user ${user.id}:`, error)
    }
  }

  return { emailsSent, pushSent }
}
