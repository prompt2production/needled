import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createWeighInSchema } from '@/lib/validations/weigh-in'

describe('createWeighInSchema', () => {
  // Note: userId is no longer part of the schema - it comes from authenticated session
  const validData = {
    weight: 85,
  }

  beforeEach(() => {
    // Mock current date for consistent date validation tests
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-24T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('weight validation', () => {
    it('should accept weight within range (40-300)', () => {
      const result = createWeighInSchema.safeParse({ ...validData, weight: 100 })
      expect(result.success).toBe(true)
    })

    it('should accept boundary value 40', () => {
      const result = createWeighInSchema.safeParse({ ...validData, weight: 40 })
      expect(result.success).toBe(true)
    })

    it('should accept boundary value 300', () => {
      const result = createWeighInSchema.safeParse({ ...validData, weight: 300 })
      expect(result.success).toBe(true)
    })

    it('should reject weight below 40', () => {
      const result = createWeighInSchema.safeParse({ ...validData, weight: 39 })
      expect(result.success).toBe(false)
    })

    it('should reject weight above 300', () => {
      const result = createWeighInSchema.safeParse({ ...validData, weight: 301 })
      expect(result.success).toBe(false)
    })

    it('should reject zero weight', () => {
      const result = createWeighInSchema.safeParse({ ...validData, weight: 0 })
      expect(result.success).toBe(false)
    })

    it('should reject negative weight', () => {
      const result = createWeighInSchema.safeParse({ ...validData, weight: -10 })
      expect(result.success).toBe(false)
    })

    it('should accept decimal weight', () => {
      const result = createWeighInSchema.safeParse({ ...validData, weight: 85.5 })
      expect(result.success).toBe(true)
    })

    it('should reject missing weight', () => {
      const result = createWeighInSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('date validation (optional field)', () => {
    it('should accept data without date (optional)', () => {
      const result = createWeighInSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.date).toBeUndefined()
      }
    })

    it('should accept today\'s date', () => {
      const result = createWeighInSchema.safeParse({
        ...validData,
        date: '2026-01-24',
      })
      expect(result.success).toBe(true)
    })

    it('should accept a past date within 90 days', () => {
      const result = createWeighInSchema.safeParse({
        ...validData,
        date: '2025-12-25',
      })
      expect(result.success).toBe(true)
    })

    it('should reject a future date', () => {
      const result = createWeighInSchema.safeParse({
        ...validData,
        date: '2026-01-25',
      })
      expect(result.success).toBe(false)
    })

    it('should reject a date more than 90 days in the past', () => {
      const result = createWeighInSchema.safeParse({
        ...validData,
        date: '2025-10-25',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid date format', () => {
      const result = createWeighInSchema.safeParse({
        ...validData,
        date: '01-24-2026',
      })
      expect(result.success).toBe(false)
    })
  })
})
