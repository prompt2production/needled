import { startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'

/**
 * Get the start of the week (Monday 00:00:00) for a given date
 */
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }) // 1 = Monday
}

/**
 * Get the end of the week (Sunday 23:59:59.999) for a given date
 */
export function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 }) // 1 = Monday
}

/**
 * Check if a date is in the current week (Monday-Sunday)
 */
export function isCurrentWeek(date: Date): boolean {
  const now = new Date()
  const weekStart = getWeekStart(now)
  const weekEnd = getWeekEnd(now)

  return isWithinInterval(date, { start: weekStart, end: weekEnd })
}
