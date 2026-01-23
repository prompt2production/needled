import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getWeekDates, getDateString, isToday, isFuture, isPast } from '@/lib/habit-dates'

describe('habit date utilities', () => {
  describe('getWeekDates', () => {
    it('should return 7 dates starting from Monday', () => {
      // Wednesday, January 22, 2025
      const wednesday = new Date(2025, 0, 22)
      const result = getWeekDates(wednesday)

      expect(result).toHaveLength(7)
      expect(result[0].getDay()).toBe(1) // Monday
      expect(result[6].getDay()).toBe(0) // Sunday
    })

    it('should return correct week for a Monday', () => {
      // Monday, January 20, 2025
      const monday = new Date(2025, 0, 20)
      const result = getWeekDates(monday)

      expect(result[0].getDate()).toBe(20) // Monday Jan 20
      expect(result[6].getDate()).toBe(26) // Sunday Jan 26
    })

    it('should return correct week for a Sunday', () => {
      // Sunday, January 26, 2025
      const sunday = new Date(2025, 0, 26)
      const result = getWeekDates(sunday)

      expect(result[0].getDate()).toBe(20) // Monday Jan 20
      expect(result[6].getDate()).toBe(26) // Sunday Jan 26
    })

    it('should handle week spanning across months', () => {
      // Wednesday, January 29, 2025 - week is Jan 27 to Feb 2
      const wednesday = new Date(2025, 0, 29)
      const result = getWeekDates(wednesday)

      expect(result[0].getMonth()).toBe(0) // January
      expect(result[0].getDate()).toBe(27) // Monday Jan 27
      expect(result[6].getMonth()).toBe(1) // February
      expect(result[6].getDate()).toBe(2) // Sunday Feb 2
    })

    it('should return all dates at start of day (00:00:00)', () => {
      const date = new Date(2025, 0, 22, 15, 30, 45)
      const result = getWeekDates(date)

      for (const d of result) {
        expect(d.getHours()).toBe(0)
        expect(d.getMinutes()).toBe(0)
        expect(d.getSeconds()).toBe(0)
      }
    })
  })

  describe('getDateString', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(2025, 0, 22)
      expect(getDateString(date)).toBe('2025-01-22')
    })

    it('should pad single digit months with zero', () => {
      const date = new Date(2025, 0, 5)
      expect(getDateString(date)).toBe('2025-01-05')
    })

    it('should pad single digit days with zero', () => {
      const date = new Date(2025, 0, 9)
      expect(getDateString(date)).toBe('2025-01-09')
    })

    it('should handle December correctly', () => {
      const date = new Date(2025, 11, 31)
      expect(getDateString(date)).toBe('2025-12-31')
    })
  })

  describe('isToday', () => {
    beforeEach(() => {
      // Mock current date to Wednesday, January 22, 2025 at noon
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 0, 22, 12, 0, 0))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return true for today', () => {
      const today = new Date(2025, 0, 22)
      expect(isToday(today)).toBe(true)
    })

    it('should return true for today with different time', () => {
      const todayEvening = new Date(2025, 0, 22, 23, 59, 59)
      expect(isToday(todayEvening)).toBe(true)
    })

    it('should return false for yesterday', () => {
      const yesterday = new Date(2025, 0, 21)
      expect(isToday(yesterday)).toBe(false)
    })

    it('should return false for tomorrow', () => {
      const tomorrow = new Date(2025, 0, 23)
      expect(isToday(tomorrow)).toBe(false)
    })
  })

  describe('isFuture', () => {
    beforeEach(() => {
      // Mock current date to Wednesday, January 22, 2025 at noon
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 0, 22, 12, 0, 0))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return true for tomorrow', () => {
      const tomorrow = new Date(2025, 0, 23)
      expect(isFuture(tomorrow)).toBe(true)
    })

    it('should return true for next week', () => {
      const nextWeek = new Date(2025, 0, 29)
      expect(isFuture(nextWeek)).toBe(true)
    })

    it('should return false for today', () => {
      const today = new Date(2025, 0, 22)
      expect(isFuture(today)).toBe(false)
    })

    it('should return false for today with different time', () => {
      const todayEvening = new Date(2025, 0, 22, 23, 59, 59)
      expect(isFuture(todayEvening)).toBe(false)
    })

    it('should return false for yesterday', () => {
      const yesterday = new Date(2025, 0, 21)
      expect(isFuture(yesterday)).toBe(false)
    })
  })

  describe('isPast', () => {
    beforeEach(() => {
      // Mock current date to Wednesday, January 22, 2025 at noon
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 0, 22, 12, 0, 0))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return true for yesterday', () => {
      const yesterday = new Date(2025, 0, 21)
      expect(isPast(yesterday)).toBe(true)
    })

    it('should return true for last week', () => {
      const lastWeek = new Date(2025, 0, 15)
      expect(isPast(lastWeek)).toBe(true)
    })

    it('should return false for today', () => {
      const today = new Date(2025, 0, 22)
      expect(isPast(today)).toBe(false)
    })

    it('should return false for today with different time', () => {
      const todayMorning = new Date(2025, 0, 22, 6, 0, 0)
      expect(isPast(todayMorning)).toBe(false)
    })

    it('should return false for tomorrow', () => {
      const tomorrow = new Date(2025, 0, 23)
      expect(isPast(tomorrow)).toBe(false)
    })
  })
})
