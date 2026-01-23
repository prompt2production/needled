import { describe, it, expect } from 'vitest'
import {
  getInjectionWeekStart,
  getInjectionWeekEnd,
  isInjectionDay,
  getDaysUntilInjection,
  getDaysOverdue,
} from '@/lib/injection-week'

// Injection day constants: 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
const MONDAY = 0
const TUESDAY = 1
const WEDNESDAY = 2
const THURSDAY = 3
const FRIDAY = 4
const SATURDAY = 5
const SUNDAY = 6

describe('injection week utilities', () => {
  describe('getInjectionWeekStart', () => {
    it('should return injection day for a date on injection day (Wednesday)', () => {
      // Wednesday, January 22, 2025
      const wednesday = new Date(2025, 0, 22, 10, 30, 0)
      const result = getInjectionWeekStart(wednesday, WEDNESDAY)

      expect(result.getDate()).toBe(22)
      expect(result.getMonth()).toBe(0)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
    })

    it('should return previous injection day when date is after injection day', () => {
      // Friday, January 24, 2025 - if injection day is Wednesday
      const friday = new Date(2025, 0, 24, 15, 45, 30)
      const result = getInjectionWeekStart(friday, WEDNESDAY)

      expect(result.getDate()).toBe(22) // Previous Wednesday
      expect(result.getMonth()).toBe(0)
    })

    it('should return previous injection day when date is before injection day', () => {
      // Monday, January 20, 2025 - if injection day is Wednesday
      const monday = new Date(2025, 0, 20, 10, 0, 0)
      const result = getInjectionWeekStart(monday, WEDNESDAY)

      // Previous Wednesday is January 15
      expect(result.getDate()).toBe(15)
      expect(result.getMonth()).toBe(0)
    })

    it('should handle Monday as injection day', () => {
      // Wednesday, January 22, 2025 - if injection day is Monday
      const wednesday = new Date(2025, 0, 22, 12, 0, 0)
      const result = getInjectionWeekStart(wednesday, MONDAY)

      expect(result.getDate()).toBe(20) // Monday January 20
    })

    it('should handle Sunday as injection day', () => {
      // Wednesday, January 22, 2025 - if injection day is Sunday
      const wednesday = new Date(2025, 0, 22, 12, 0, 0)
      const result = getInjectionWeekStart(wednesday, SUNDAY)

      expect(result.getDate()).toBe(19) // Previous Sunday January 19
    })

    it('should handle week spanning across months', () => {
      // Monday, February 3, 2025 - if injection day is Friday
      const monday = new Date(2025, 1, 3, 10, 0, 0)
      const result = getInjectionWeekStart(monday, FRIDAY)

      expect(result.getDate()).toBe(31) // Previous Friday January 31
      expect(result.getMonth()).toBe(0) // January
    })
  })

  describe('getInjectionWeekEnd', () => {
    it('should return day before next injection day at 23:59:59', () => {
      // Wednesday, January 22, 2025 - if injection day is Wednesday
      const wednesday = new Date(2025, 0, 22, 10, 0, 0)
      const result = getInjectionWeekEnd(wednesday, WEDNESDAY)

      expect(result.getDate()).toBe(28) // Tuesday January 28
      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
      expect(result.getSeconds()).toBe(59)
    })

    it('should return correct end for Friday as injection day', () => {
      // Friday, January 24, 2025 - if injection day is Friday
      const friday = new Date(2025, 0, 24, 12, 0, 0)
      const result = getInjectionWeekEnd(friday, FRIDAY)

      expect(result.getDate()).toBe(30) // Thursday January 30
    })

    it('should handle week end spanning across months', () => {
      // Monday, January 27, 2025 - if injection day is Monday
      const monday = new Date(2025, 0, 27, 10, 0, 0)
      const result = getInjectionWeekEnd(monday, MONDAY)

      expect(result.getDate()).toBe(2) // Sunday February 2
      expect(result.getMonth()).toBe(1) // February
    })
  })

  describe('isInjectionDay', () => {
    it('should return true when date matches injection day', () => {
      // Wednesday, January 22, 2025
      const wednesday = new Date(2025, 0, 22, 14, 30, 0)
      expect(isInjectionDay(wednesday, WEDNESDAY)).toBe(true)
    })

    it('should return false when date does not match injection day', () => {
      // Wednesday, January 22, 2025
      const wednesday = new Date(2025, 0, 22, 14, 30, 0)
      expect(isInjectionDay(wednesday, MONDAY)).toBe(false)
    })

    it('should work for Monday', () => {
      // Monday, January 20, 2025
      const monday = new Date(2025, 0, 20)
      expect(isInjectionDay(monday, MONDAY)).toBe(true)
      expect(isInjectionDay(monday, TUESDAY)).toBe(false)
    })

    it('should work for Sunday', () => {
      // Sunday, January 26, 2025
      const sunday = new Date(2025, 0, 26)
      expect(isInjectionDay(sunday, SUNDAY)).toBe(true)
      expect(isInjectionDay(sunday, SATURDAY)).toBe(false)
    })
  })

  describe('getDaysUntilInjection', () => {
    it('should return 0 on injection day', () => {
      // Wednesday, January 22, 2025 - injection day is Wednesday
      const wednesday = new Date(2025, 0, 22)
      expect(getDaysUntilInjection(wednesday, WEDNESDAY)).toBe(0)
    })

    it('should return days until next injection day', () => {
      // Monday, January 20, 2025 - injection day is Wednesday
      const monday = new Date(2025, 0, 20)
      expect(getDaysUntilInjection(monday, WEDNESDAY)).toBe(2)
    })

    it('should return days counting forward to next week', () => {
      // Thursday, January 23, 2025 - injection day is Wednesday
      const thursday = new Date(2025, 0, 23)
      expect(getDaysUntilInjection(thursday, WEDNESDAY)).toBe(6)
    })

    it('should return 1 day before injection day', () => {
      // Tuesday, January 21, 2025 - injection day is Wednesday
      const tuesday = new Date(2025, 0, 21)
      expect(getDaysUntilInjection(tuesday, WEDNESDAY)).toBe(1)
    })

    it('should handle Sunday injection day', () => {
      // Wednesday, January 22, 2025 - injection day is Sunday
      const wednesday = new Date(2025, 0, 22)
      expect(getDaysUntilInjection(wednesday, SUNDAY)).toBe(4)
    })
  })

  describe('getDaysOverdue', () => {
    it('should return 0 on injection day', () => {
      // Wednesday, January 22, 2025 - injection day is Wednesday
      const wednesday = new Date(2025, 0, 22)
      expect(getDaysOverdue(wednesday, WEDNESDAY)).toBe(0)
    })

    it('should return days since injection day', () => {
      // Friday, January 24, 2025 - injection day is Wednesday
      const friday = new Date(2025, 0, 24)
      expect(getDaysOverdue(friday, WEDNESDAY)).toBe(2)
    })

    it('should return 6 for day before injection day', () => {
      // Tuesday, January 21, 2025 - injection day is Wednesday
      const tuesday = new Date(2025, 0, 21)
      expect(getDaysOverdue(tuesday, WEDNESDAY)).toBe(6)
    })

    it('should return 1 for day after injection day', () => {
      // Thursday, January 23, 2025 - injection day is Wednesday
      const thursday = new Date(2025, 0, 23)
      expect(getDaysOverdue(thursday, WEDNESDAY)).toBe(1)
    })

    it('should handle Monday injection day', () => {
      // Thursday, January 23, 2025 - injection day is Monday
      const thursday = new Date(2025, 0, 23)
      expect(getDaysOverdue(thursday, MONDAY)).toBe(3)
    })

    it('should handle Sunday injection day', () => {
      // Monday, January 20, 2025 - injection day is Sunday
      const monday = new Date(2025, 0, 20)
      expect(getDaysOverdue(monday, SUNDAY)).toBe(1)
    })
  })
})
