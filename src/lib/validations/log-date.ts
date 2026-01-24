import { z } from 'zod'

const MAX_DAYS_IN_PAST = 90

/**
 * Schema for validating log dates.
 * Accepts date strings in ISO format (YYYY-MM-DD).
 * Rejects future dates and dates more than 90 days in the past.
 */
export const logDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine(
    (dateStr) => {
      const date = new Date(dateStr)
      return !isNaN(date.getTime())
    },
    { message: 'Invalid date' }
  )
  .refine(
    (dateStr) => {
      const date = new Date(dateStr)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      date.setHours(0, 0, 0, 0)
      return date <= today
    },
    { message: 'Date cannot be in the future' }
  )
  .refine(
    (dateStr) => {
      const date = new Date(dateStr)
      const minDate = new Date()
      minDate.setHours(0, 0, 0, 0)
      minDate.setDate(minDate.getDate() - MAX_DAYS_IN_PAST)
      date.setHours(0, 0, 0, 0)
      return date >= minDate
    },
    { message: `Date cannot be more than ${MAX_DAYS_IN_PAST} days in the past` }
  )

export type LogDateInput = z.infer<typeof logDateSchema>
