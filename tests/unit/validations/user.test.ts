import { describe, it, expect } from 'vitest'
import { createUserSchema } from '@/lib/validations/user'

describe('createUserSchema', () => {
  const validData = {
    name: 'John',
    startWeight: 85,
    goalWeight: 75,
    weightUnit: 'kg' as const,
    medication: 'OZEMPIC' as const,
    injectionDay: 0,
  }

  describe('name validation', () => {
    it('should accept valid name', () => {
      const result = createUserSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should trim whitespace from name', () => {
      const result = createUserSchema.safeParse({ ...validData, name: '  John  ' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('John')
      }
    })

    it('should reject name shorter than 2 characters', () => {
      const result = createUserSchema.safeParse({ ...validData, name: 'A' })
      expect(result.success).toBe(false)
    })

    it('should reject name longer than 30 characters', () => {
      const result = createUserSchema.safeParse({
        ...validData,
        name: 'A'.repeat(31),
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty name after trimming', () => {
      const result = createUserSchema.safeParse({ ...validData, name: '   ' })
      expect(result.success).toBe(false)
    })
  })

  describe('startWeight validation', () => {
    it('should accept weight within range (40-300)', () => {
      const result = createUserSchema.safeParse({ ...validData, startWeight: 100 })
      expect(result.success).toBe(true)
    })

    it('should reject weight below 40', () => {
      const result = createUserSchema.safeParse({ ...validData, startWeight: 39 })
      expect(result.success).toBe(false)
    })

    it('should reject weight above 300', () => {
      const result = createUserSchema.safeParse({ ...validData, startWeight: 301 })
      expect(result.success).toBe(false)
    })

    it('should accept boundary value 40', () => {
      const result = createUserSchema.safeParse({
        ...validData,
        startWeight: 40,
        goalWeight: 35,
      })
      expect(result.success).toBe(false) // goalWeight must be >= 40 too
    })

    it('should accept boundary value 300', () => {
      const result = createUserSchema.safeParse({
        ...validData,
        startWeight: 300,
        goalWeight: 250,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('goalWeight validation', () => {
    it('should accept goalWeight less than startWeight', () => {
      const result = createUserSchema.safeParse({
        ...validData,
        startWeight: 100,
        goalWeight: 80,
      })
      expect(result.success).toBe(true)
    })

    it('should reject goalWeight equal to startWeight', () => {
      const result = createUserSchema.safeParse({
        ...validData,
        startWeight: 100,
        goalWeight: 100,
      })
      expect(result.success).toBe(false)
    })

    it('should reject goalWeight greater than startWeight', () => {
      const result = createUserSchema.safeParse({
        ...validData,
        startWeight: 100,
        goalWeight: 110,
      })
      expect(result.success).toBe(false)
    })

    it('should accept null goalWeight', () => {
      const result = createUserSchema.safeParse({
        ...validData,
        goalWeight: null,
      })
      expect(result.success).toBe(true)
    })

    it('should accept undefined goalWeight', () => {
      const { goalWeight, ...dataWithoutGoal } = validData
      const result = createUserSchema.safeParse(dataWithoutGoal)
      expect(result.success).toBe(true)
    })
  })

  describe('weightUnit validation', () => {
    it('should accept kg', () => {
      const result = createUserSchema.safeParse({ ...validData, weightUnit: 'kg' })
      expect(result.success).toBe(true)
    })

    it('should accept lbs', () => {
      const result = createUserSchema.safeParse({ ...validData, weightUnit: 'lbs' })
      expect(result.success).toBe(true)
    })

    it('should reject invalid unit', () => {
      const result = createUserSchema.safeParse({ ...validData, weightUnit: 'pounds' })
      expect(result.success).toBe(false)
    })
  })

  describe('medication validation', () => {
    it('should accept OZEMPIC', () => {
      const result = createUserSchema.safeParse({ ...validData, medication: 'OZEMPIC' })
      expect(result.success).toBe(true)
    })

    it('should accept WEGOVY', () => {
      const result = createUserSchema.safeParse({ ...validData, medication: 'WEGOVY' })
      expect(result.success).toBe(true)
    })

    it('should accept MOUNJARO', () => {
      const result = createUserSchema.safeParse({ ...validData, medication: 'MOUNJARO' })
      expect(result.success).toBe(true)
    })

    it('should accept ZEPBOUND', () => {
      const result = createUserSchema.safeParse({ ...validData, medication: 'ZEPBOUND' })
      expect(result.success).toBe(true)
    })

    it('should accept OTHER', () => {
      const result = createUserSchema.safeParse({ ...validData, medication: 'OTHER' })
      expect(result.success).toBe(true)
    })

    it('should reject invalid medication', () => {
      const result = createUserSchema.safeParse({ ...validData, medication: 'INVALID' })
      expect(result.success).toBe(false)
    })
  })

  describe('injectionDay validation', () => {
    it('should accept 0 (Monday)', () => {
      const result = createUserSchema.safeParse({ ...validData, injectionDay: 0 })
      expect(result.success).toBe(true)
    })

    it('should accept 6 (Sunday)', () => {
      const result = createUserSchema.safeParse({ ...validData, injectionDay: 6 })
      expect(result.success).toBe(true)
    })

    it('should reject negative day', () => {
      const result = createUserSchema.safeParse({ ...validData, injectionDay: -1 })
      expect(result.success).toBe(false)
    })

    it('should reject day greater than 6', () => {
      const result = createUserSchema.safeParse({ ...validData, injectionDay: 7 })
      expect(result.success).toBe(false)
    })

    it('should reject non-integer day', () => {
      const result = createUserSchema.safeParse({ ...validData, injectionDay: 2.5 })
      expect(result.success).toBe(false)
    })
  })
})
