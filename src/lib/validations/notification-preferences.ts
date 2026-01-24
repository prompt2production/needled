import { z } from 'zod'

// HH:mm time format validation
const timeFormat = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format')

export const notificationPreferencesInputSchema = z.object({
  injectionReminder: z.boolean(),
  weighInReminder: z.boolean(),
  habitReminder: z.boolean(),
  reminderTime: timeFormat,
  habitReminderTime: timeFormat,
  timezone: z.string().min(1, 'Timezone is required'),
})

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesInputSchema>

export const notificationPreferencesSchema = notificationPreferencesInputSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>
