import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { logDateSchema } from '@/lib/validations/log-date'

describe('logDateSchema', () => {
  beforeEach(() => {
    // Mock current date to 2026-01-24 for consistent testing
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-24T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('valid dates', () => {
    it('should accept today\'s date', () => {
      const result = logDateSchema.safeParse('2026-01-24')
      expect(result.success).toBe(true)
    })

    it('should accept yesterday\'s date', () => {
      const result = logDateSchema.safeParse('2026-01-23')
      expect(result.success).toBe(true)
    })

    it('should accept a date within 90 days', () => {
      // 30 days ago
      const result = logDateSchema.safeParse('2025-12-25')
      expect(result.success).toBe(true)
    })

    it('should accept a date exactly 90 days in the past', () => {
      // 90 days before 2026-01-24 is 2025-10-26
      const result = logDateSchema.safeParse('2025-10-26')
      expect(result.success).toBe(true)
    })
  })

  describe('invalid dates - future', () => {
    it('should reject tomorrow\'s date', () => {
      const result = logDateSchema.safeParse('2026-01-25')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Date cannot be in the future')
      }
    })

    it('should reject a date far in the future', () => {
      const result = logDateSchema.safeParse('2027-01-01')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Date cannot be in the future')
      }
    })
  })

  describe('invalid dates - too old', () => {
    it('should reject a date 91 days in the past', () => {
      // 91 days before 2026-01-24 is 2025-10-25
      const result = logDateSchema.safeParse('2025-10-25')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Date cannot be more than 90 days in the past')
      }
    })

    it('should reject a date far in the past', () => {
      const result = logDateSchema.safeParse('2020-01-01')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Date cannot be more than 90 days in the past')
      }
    })
  })

  describe('invalid date format', () => {
    it('should reject invalid date format', () => {
      const result = logDateSchema.safeParse('01-24-2026')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Date must be in YYYY-MM-DD format')
      }
    })

    it('should reject non-date strings', () => {
      const result = logDateSchema.safeParse('not a date')
      expect(result.success).toBe(false)
    })

    it('should reject empty string', () => {
      const result = logDateSchema.safeParse('')
      expect(result.success).toBe(false)
    })

    it('should reject date with wrong separator', () => {
      const result = logDateSchema.safeParse('2026/01/24')
      expect(result.success).toBe(false)
    })

    it('should reject invalid date values', () => {
      // Invalid month
      const result = logDateSchema.safeParse('2026-13-01')
      expect(result.success).toBe(false)
    })
  })
})
