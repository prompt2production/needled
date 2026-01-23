import { startOfDay, addDays, format } from 'date-fns'

/**
 * Convert JavaScript's getDay() (0 = Sunday) to our system (0 = Monday).
 */
function getDayOfWeek(date: Date): number {
  const jsDay = date.getDay()
  // JavaScript: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  // Our system: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  return jsDay === 0 ? 6 : jsDay - 1
}

/**
 * Get the dates for the week containing the given date.
 * Week runs Monday to Sunday.
 *
 * @param date - A date within the desired week
 * @returns Array of 7 dates (Monday to Sunday)
 */
export function getWeekDates(date: Date): Date[] {
  const dayOfWeek = getDayOfWeek(date) // 0 = Monday, 6 = Sunday
  const monday = startOfDay(addDays(date, -dayOfWeek))

  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(monday, i))
  }
  return dates
}

/**
 * Get an ISO date string in YYYY-MM-DD format.
 *
 * @param date - The date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function getDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Check if a date is today.
 *
 * @param date - The date to check
 * @returns True if the date is today
 */
export function isToday(date: Date): boolean {
  const today = startOfDay(new Date())
  const checkDate = startOfDay(date)
  return checkDate.getTime() === today.getTime()
}

/**
 * Check if a date is in the future (after today).
 *
 * @param date - The date to check
 * @returns True if the date is after today
 */
export function isFuture(date: Date): boolean {
  const today = startOfDay(new Date())
  const checkDate = startOfDay(date)
  return checkDate.getTime() > today.getTime()
}

/**
 * Check if a date is in the past (before today).
 *
 * @param date - The date to check
 * @returns True if the date is before today
 */
export function isPast(date: Date): boolean {
  const today = startOfDay(new Date())
  const checkDate = startOfDay(date)
  return checkDate.getTime() < today.getTime()
}
