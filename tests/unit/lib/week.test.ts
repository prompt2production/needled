import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getWeekStart, getWeekEnd, isCurrentWeek } from '@/lib/week'

describe('week utilities', () => {
  describe('getWeekStart', () => {
    it('should return Monday 00:00:00 for a date on Monday', () => {
      // Monday, January 20, 2025
      const monday = new Date(2025, 0, 20, 10, 30, 0)
      const result = getWeekStart(monday)

      expect(result.getDay()).toBe(1) // Monday
      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(20)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
    })

    it('should return Monday 00:00:00 for a date on Wednesday', () => {
      // Wednesday, January 22, 2025
      const wednesday = new Date(2025, 0, 22, 15, 45, 30)
      const result = getWeekStart(wednesday)

      expect(result.getDay()).toBe(1) // Monday
      expect(result.getDate()).toBe(20) // Monday of that week
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
    })

    it('should return Monday 00:00:00 for a date on Sunday', () => {
      // Sunday, January 26, 2025
      const sunday = new Date(2025, 0, 26, 23, 59, 59)
      const result = getWeekStart(sunday)

      expect(result.getDay()).toBe(1) // Monday
      expect(result.getDate()).toBe(20) // Monday of that week
    })

    it('should handle week spanning across months', () => {
      // Friday, January 31, 2025 - week starts Monday January 27
      const friday = new Date(2025, 0, 31)
      const result = getWeekStart(friday)

      expect(result.getDay()).toBe(1)
      expect(result.getDate()).toBe(27)
      expect(result.getMonth()).toBe(0)
    })
  })

  describe('getWeekEnd', () => {
    it('should return Sunday 23:59:59.999 for a date on Monday', () => {
      // Monday, January 20, 2025
      const monday = new Date(2025, 0, 20, 10, 30, 0)
      const result = getWeekEnd(monday)

      expect(result.getDay()).toBe(0) // Sunday
      expect(result.getDate()).toBe(26) // Sunday of that week
      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
      expect(result.getSeconds()).toBe(59)
    })

    it('should return Sunday 23:59:59.999 for a date on Friday', () => {
      // Friday, January 24, 2025
      const friday = new Date(2025, 0, 24, 12, 0, 0)
      const result = getWeekEnd(friday)

      expect(result.getDay()).toBe(0) // Sunday
      expect(result.getDate()).toBe(26)
    })

    it('should return Sunday 23:59:59.999 for a date on Sunday', () => {
      // Sunday, January 26, 2025
      const sunday = new Date(2025, 0, 26, 10, 0, 0)
      const result = getWeekEnd(sunday)

      expect(result.getDay()).toBe(0) // Sunday
      expect(result.getDate()).toBe(26)
      expect(result.getHours()).toBe(23)
    })

    it('should handle week spanning across months', () => {
      // Monday, January 27, 2025 - week ends Sunday February 2
      const monday = new Date(2025, 0, 27)
      const result = getWeekEnd(monday)

      expect(result.getDay()).toBe(0)
      expect(result.getDate()).toBe(2)
      expect(result.getMonth()).toBe(1) // February
    })
  })

  describe('isCurrentWeek', () => {
    beforeEach(() => {
      // Mock current date to Wednesday, January 22, 2025
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 0, 22, 12, 0, 0))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return true for date on the same day', () => {
      const sameDay = new Date(2025, 0, 22, 10, 0, 0)
      expect(isCurrentWeek(sameDay)).toBe(true)
    })

    it('should return true for date on Monday of current week', () => {
      const monday = new Date(2025, 0, 20, 0, 0, 0)
      expect(isCurrentWeek(monday)).toBe(true)
    })

    it('should return true for date on Sunday of current week', () => {
      const sunday = new Date(2025, 0, 26, 23, 59, 59)
      expect(isCurrentWeek(sunday)).toBe(true)
    })

    it('should return false for date in previous week', () => {
      const previousWeek = new Date(2025, 0, 19, 12, 0, 0) // Sunday previous week
      expect(isCurrentWeek(previousWeek)).toBe(false)
    })

    it('should return false for date in next week', () => {
      const nextWeek = new Date(2025, 0, 27, 0, 0, 0) // Monday next week
      expect(isCurrentWeek(nextWeek)).toBe(false)
    })

    it('should return false for date from different month', () => {
      const differentMonth = new Date(2025, 1, 1, 12, 0, 0)
      expect(isCurrentWeek(differentMonth)).toBe(false)
    })
  })
})
