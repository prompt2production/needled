import { startOfDay, addDays, differenceInDays } from 'date-fns'

/**
 * Get the start of the injection week containing the given date.
 * The injection week starts on the user's chosen injection day.
 *
 * @param date - The date to check
 * @param injectionDay - The injection day (0 = Monday, 6 = Sunday)
 * @returns The start of the injection week (injection day at 00:00:00)
 */
export function getInjectionWeekStart(date: Date, injectionDay: number): Date {
  const dayOfWeek = getDayOfWeek(date) // 0 = Monday, 6 = Sunday
  const daysSinceInjectionDay = (dayOfWeek - injectionDay + 7) % 7

  return startOfDay(addDays(date, -daysSinceInjectionDay))
}

/**
 * Get the end of the injection week containing the given date.
 * The injection week ends the day before the next injection day at 23:59:59.999.
 *
 * @param date - The date to check
 * @param injectionDay - The injection day (0 = Monday, 6 = Sunday)
 * @returns The end of the injection week
 */
export function getInjectionWeekEnd(date: Date, injectionDay: number): Date {
  const weekStart = getInjectionWeekStart(date, injectionDay)
  const weekEnd = addDays(weekStart, 6)

  // Set to end of day (23:59:59.999)
  weekEnd.setHours(23, 59, 59, 999)
  return weekEnd
}

/**
 * Check if the given date is the injection day.
 *
 * @param date - The date to check
 * @param injectionDay - The injection day (0 = Monday, 6 = Sunday)
 * @returns True if the date is the injection day
 */
export function isInjectionDay(date: Date, injectionDay: number): boolean {
  const dayOfWeek = getDayOfWeek(date)
  return dayOfWeek === injectionDay
}

/**
 * Get the number of days until the next injection day.
 * Returns 0 if today is the injection day.
 *
 * @param date - The current date
 * @param injectionDay - The injection day (0 = Monday, 6 = Sunday)
 * @returns Days until next injection day (0-6)
 */
export function getDaysUntilInjection(date: Date, injectionDay: number): number {
  const dayOfWeek = getDayOfWeek(date)
  return (injectionDay - dayOfWeek + 7) % 7
}

/**
 * Get the number of days past the injection day.
 * Returns 0 if today is the injection day or before it in the current injection week.
 *
 * @param date - The current date
 * @param injectionDay - The injection day (0 = Monday, 6 = Sunday)
 * @returns Days past injection day (0 if not overdue)
 */
export function getDaysOverdue(date: Date, injectionDay: number): number {
  const dayOfWeek = getDayOfWeek(date)

  // Days since injection day in the current week
  const daysSinceInjectionDay = (dayOfWeek - injectionDay + 7) % 7

  // If it's the injection day itself (0 days since), not overdue
  // If it's past injection day, that's how many days overdue
  return daysSinceInjectionDay
}

/**
 * Convert JavaScript's getDay() (0 = Sunday) to our system (0 = Monday).
 */
function getDayOfWeek(date: Date): number {
  const jsDay = date.getDay()
  // JavaScript: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  // Our system: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  return jsDay === 0 ? 6 : jsDay - 1
}
