import { describe, it, expect } from 'vitest'
import { createWeighInSchema } from '@/lib/validations/weigh-in'

describe('createWeighInSchema', () => {
  const validData = {
    userId: 'user123',
    weight: 85,
  }

  describe('userId validation', () => {
    it('should accept valid userId', () => {
      const result = createWeighInSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty userId', () => {
      const result = createWeighInSchema.safeParse({ ...validData, userId: '' })
      expect(result.success).toBe(false)
    })

    it('should reject missing userId', () => {
      const { userId, ...dataWithoutUserId } = validData
      const result = createWeighInSchema.safeParse(dataWithoutUserId)
      expect(result.success).toBe(false)
    })
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
      const { weight, ...dataWithoutWeight } = validData
      const result = createWeighInSchema.safeParse(dataWithoutWeight)
      expect(result.success).toBe(false)
    })
  })
})
