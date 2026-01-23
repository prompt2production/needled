import { describe, it, expect } from 'vitest'
import { toggleHabitSchema, getHabitsSchema, habitTypeEnum } from '@/lib/validations/habit'

describe('habitTypeEnum', () => {
  it('should contain all 3 habit types', () => {
    const types = habitTypeEnum.options
    expect(types).toHaveLength(3)
    expect(types).toContain('water')
    expect(types).toContain('nutrition')
    expect(types).toContain('exercise')
  })

  it('should accept water', () => {
    const result = habitTypeEnum.safeParse('water')
    expect(result.success).toBe(true)
  })

  it('should accept nutrition', () => {
    const result = habitTypeEnum.safeParse('nutrition')
    expect(result.success).toBe(true)
  })

  it('should accept exercise', () => {
    const result = habitTypeEnum.safeParse('exercise')
    expect(result.success).toBe(true)
  })

  it('should reject invalid habit type', () => {
    const result = habitTypeEnum.safeParse('invalid')
    expect(result.success).toBe(false)
  })
})

describe('toggleHabitSchema', () => {
  const validData = {
    userId: 'user123',
    habit: 'water' as const,
    value: true,
  }

  describe('userId validation', () => {
    it('should accept valid userId', () => {
      const result = toggleHabitSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty userId', () => {
      const result = toggleHabitSchema.safeParse({ ...validData, userId: '' })
      expect(result.success).toBe(false)
    })

    it('should reject missing userId', () => {
      const { userId, ...dataWithoutUserId } = validData
      const result = toggleHabitSchema.safeParse(dataWithoutUserId)
      expect(result.success).toBe(false)
    })
  })

  describe('habit validation', () => {
    it('should accept water', () => {
      const result = toggleHabitSchema.safeParse({ ...validData, habit: 'water' })
      expect(result.success).toBe(true)
    })

    it('should accept nutrition', () => {
      const result = toggleHabitSchema.safeParse({ ...validData, habit: 'nutrition' })
      expect(result.success).toBe(true)
    })

    it('should accept exercise', () => {
      const result = toggleHabitSchema.safeParse({ ...validData, habit: 'exercise' })
      expect(result.success).toBe(true)
    })

    it('should reject invalid habit type', () => {
      const result = toggleHabitSchema.safeParse({ ...validData, habit: 'invalid' })
      expect(result.success).toBe(false)
    })

    it('should reject missing habit', () => {
      const { habit, ...dataWithoutHabit } = validData
      const result = toggleHabitSchema.safeParse(dataWithoutHabit)
      expect(result.success).toBe(false)
    })
  })

  describe('value validation', () => {
    it('should accept true', () => {
      const result = toggleHabitSchema.safeParse({ ...validData, value: true })
      expect(result.success).toBe(true)
    })

    it('should accept false', () => {
      const result = toggleHabitSchema.safeParse({ ...validData, value: false })
      expect(result.success).toBe(true)
    })

    it('should reject non-boolean value', () => {
      const result = toggleHabitSchema.safeParse({ ...validData, value: 'true' })
      expect(result.success).toBe(false)
    })

    it('should reject missing value', () => {
      const { value, ...dataWithoutValue } = validData
      const result = toggleHabitSchema.safeParse(dataWithoutValue)
      expect(result.success).toBe(false)
    })
  })
})

describe('getHabitsSchema', () => {
  const validData = {
    userId: 'user123',
  }

  describe('userId validation', () => {
    it('should accept valid userId', () => {
      const result = getHabitsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty userId', () => {
      const result = getHabitsSchema.safeParse({ ...validData, userId: '' })
      expect(result.success).toBe(false)
    })

    it('should reject missing userId', () => {
      const result = getHabitsSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('startDate validation', () => {
    it('should accept valid startDate', () => {
      const result = getHabitsSchema.safeParse({ ...validData, startDate: '2025-01-01' })
      expect(result.success).toBe(true)
    })

    it('should accept missing startDate (optional)', () => {
      const result = getHabitsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid startDate format', () => {
      const result = getHabitsSchema.safeParse({ ...validData, startDate: '01-01-2025' })
      expect(result.success).toBe(false)
    })

    it('should reject startDate with invalid format', () => {
      const result = getHabitsSchema.safeParse({ ...validData, startDate: '2025/01/01' })
      expect(result.success).toBe(false)
    })
  })

  describe('endDate validation', () => {
    it('should accept valid endDate', () => {
      const result = getHabitsSchema.safeParse({ ...validData, endDate: '2025-01-31' })
      expect(result.success).toBe(true)
    })

    it('should accept missing endDate (optional)', () => {
      const result = getHabitsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid endDate format', () => {
      const result = getHabitsSchema.safeParse({ ...validData, endDate: '31-01-2025' })
      expect(result.success).toBe(false)
    })
  })

  describe('date range validation', () => {
    it('should accept both startDate and endDate', () => {
      const result = getHabitsSchema.safeParse({
        ...validData,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      })
      expect(result.success).toBe(true)
    })
  })
})
