import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createInjectionSchema, doseNumberSchema, injectionSiteEnum, updateInjectionSchema } from '@/lib/validations/injection'

describe('createInjectionSchema', () => {
  const validData = {
    userId: 'user123',
    site: 'ABDOMEN_LEFT' as const,
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-24T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('userId validation', () => {
    it('should accept valid userId', () => {
      const result = createInjectionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty userId', () => {
      const result = createInjectionSchema.safeParse({ ...validData, userId: '' })
      expect(result.success).toBe(false)
    })

    it('should reject missing userId', () => {
      const { userId, ...dataWithoutUserId } = validData
      const result = createInjectionSchema.safeParse(dataWithoutUserId)
      expect(result.success).toBe(false)
    })
  })

  describe('site validation', () => {
    it('should accept ABDOMEN_LEFT', () => {
      const result = createInjectionSchema.safeParse({ ...validData, site: 'ABDOMEN_LEFT' })
      expect(result.success).toBe(true)
    })

    it('should accept ABDOMEN_RIGHT', () => {
      const result = createInjectionSchema.safeParse({ ...validData, site: 'ABDOMEN_RIGHT' })
      expect(result.success).toBe(true)
    })

    it('should accept THIGH_LEFT', () => {
      const result = createInjectionSchema.safeParse({ ...validData, site: 'THIGH_LEFT' })
      expect(result.success).toBe(true)
    })

    it('should accept THIGH_RIGHT', () => {
      const result = createInjectionSchema.safeParse({ ...validData, site: 'THIGH_RIGHT' })
      expect(result.success).toBe(true)
    })

    it('should accept UPPER_ARM_LEFT', () => {
      const result = createInjectionSchema.safeParse({ ...validData, site: 'UPPER_ARM_LEFT' })
      expect(result.success).toBe(true)
    })

    it('should accept UPPER_ARM_RIGHT', () => {
      const result = createInjectionSchema.safeParse({ ...validData, site: 'UPPER_ARM_RIGHT' })
      expect(result.success).toBe(true)
    })

    it('should reject invalid site value', () => {
      const result = createInjectionSchema.safeParse({ ...validData, site: 'INVALID_SITE' })
      expect(result.success).toBe(false)
    })

    it('should reject missing site', () => {
      const { site, ...dataWithoutSite } = validData
      const result = createInjectionSchema.safeParse(dataWithoutSite)
      expect(result.success).toBe(false)
    })
  })

  describe('notes validation', () => {
    it('should accept valid notes', () => {
      const result = createInjectionSchema.safeParse({ ...validData, notes: 'This is a note' })
      expect(result.success).toBe(true)
    })

    it('should accept missing notes (optional)', () => {
      const result = createInjectionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept undefined notes', () => {
      const result = createInjectionSchema.safeParse({ ...validData, notes: undefined })
      expect(result.success).toBe(true)
    })

    it('should accept empty string notes', () => {
      const result = createInjectionSchema.safeParse({ ...validData, notes: '' })
      expect(result.success).toBe(true)
    })

    it('should accept notes at max length (500 characters)', () => {
      const maxLengthNotes = 'a'.repeat(500)
      const result = createInjectionSchema.safeParse({ ...validData, notes: maxLengthNotes })
      expect(result.success).toBe(true)
    })

    it('should reject notes exceeding max length (501+ characters)', () => {
      const tooLongNotes = 'a'.repeat(501)
      const result = createInjectionSchema.safeParse({ ...validData, notes: tooLongNotes })
      expect(result.success).toBe(false)
    })
  })

  describe('doseNumber validation', () => {
    it('should accept doseNumber 1', () => {
      const result = createInjectionSchema.safeParse({ ...validData, doseNumber: 1 })
      expect(result.success).toBe(true)
    })

    it('should accept doseNumber 2', () => {
      const result = createInjectionSchema.safeParse({ ...validData, doseNumber: 2 })
      expect(result.success).toBe(true)
    })

    it('should accept doseNumber 3', () => {
      const result = createInjectionSchema.safeParse({ ...validData, doseNumber: 3 })
      expect(result.success).toBe(true)
    })

    it('should accept doseNumber 4', () => {
      const result = createInjectionSchema.safeParse({ ...validData, doseNumber: 4 })
      expect(result.success).toBe(true)
    })

    it('should accept missing doseNumber (optional)', () => {
      const result = createInjectionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject doseNumber 0', () => {
      const result = createInjectionSchema.safeParse({ ...validData, doseNumber: 0 })
      expect(result.success).toBe(false)
    })

    it('should reject doseNumber 5', () => {
      const result = createInjectionSchema.safeParse({ ...validData, doseNumber: 5 })
      expect(result.success).toBe(false)
    })

    it('should reject decimal doseNumber', () => {
      const result = createInjectionSchema.safeParse({ ...validData, doseNumber: 2.5 })
      expect(result.success).toBe(false)
    })

    it('should reject string doseNumber', () => {
      const result = createInjectionSchema.safeParse({ ...validData, doseNumber: '2' })
      expect(result.success).toBe(false)
    })

    it('should reject negative doseNumber', () => {
      const result = createInjectionSchema.safeParse({ ...validData, doseNumber: -1 })
      expect(result.success).toBe(false)
    })
  })

  describe('date validation (optional field)', () => {
    it('should accept data without date (optional)', () => {
      const result = createInjectionSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.date).toBeUndefined()
      }
    })

    it('should accept today\'s date', () => {
      const result = createInjectionSchema.safeParse({
        ...validData,
        date: '2026-01-24',
      })
      expect(result.success).toBe(true)
    })

    it('should accept a past date within 90 days', () => {
      const result = createInjectionSchema.safeParse({
        ...validData,
        date: '2025-12-25',
      })
      expect(result.success).toBe(true)
    })

    it('should reject a future date', () => {
      const result = createInjectionSchema.safeParse({
        ...validData,
        date: '2026-01-25',
      })
      expect(result.success).toBe(false)
    })

    it('should reject a date more than 90 days in the past', () => {
      const result = createInjectionSchema.safeParse({
        ...validData,
        date: '2025-10-25',
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('updateInjectionSchema', () => {
  const validData = {
    userId: 'user123',
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-24T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should accept userId only (all other fields optional)', () => {
    const result = updateInjectionSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should accept site update', () => {
    const result = updateInjectionSchema.safeParse({
      ...validData,
      site: 'THIGH_RIGHT',
    })
    expect(result.success).toBe(true)
  })

  it('should accept date update', () => {
    const result = updateInjectionSchema.safeParse({
      ...validData,
      date: '2026-01-20',
    })
    expect(result.success).toBe(true)
  })

  it('should accept notes update', () => {
    const result = updateInjectionSchema.safeParse({
      ...validData,
      notes: 'Updated notes',
    })
    expect(result.success).toBe(true)
  })

  describe('doseNumber update', () => {
    it('should accept valid doseNumber update (1-4)', () => {
      const result = updateInjectionSchema.safeParse({
        ...validData,
        doseNumber: 3,
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid doseNumber update (0)', () => {
      const result = updateInjectionSchema.safeParse({
        ...validData,
        doseNumber: 0,
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid doseNumber update (5)', () => {
      const result = updateInjectionSchema.safeParse({
        ...validData,
        doseNumber: 5,
      })
      expect(result.success).toBe(false)
    })

    it('should reject decimal doseNumber update', () => {
      const result = updateInjectionSchema.safeParse({
        ...validData,
        doseNumber: 1.5,
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('doseNumberSchema', () => {
  it('should accept valid dose numbers 1-4', () => {
    expect(doseNumberSchema.safeParse(1).success).toBe(true)
    expect(doseNumberSchema.safeParse(2).success).toBe(true)
    expect(doseNumberSchema.safeParse(3).success).toBe(true)
    expect(doseNumberSchema.safeParse(4).success).toBe(true)
  })

  it('should reject invalid dose numbers', () => {
    expect(doseNumberSchema.safeParse(0).success).toBe(false)
    expect(doseNumberSchema.safeParse(5).success).toBe(false)
    expect(doseNumberSchema.safeParse(-1).success).toBe(false)
    expect(doseNumberSchema.safeParse(2.5).success).toBe(false)
    expect(doseNumberSchema.safeParse('2').success).toBe(false)
  })
})

describe('injectionSiteEnum', () => {
  it('should contain all 6 injection sites', () => {
    const sites = injectionSiteEnum.options
    expect(sites).toHaveLength(6)
    expect(sites).toContain('ABDOMEN_LEFT')
    expect(sites).toContain('ABDOMEN_RIGHT')
    expect(sites).toContain('THIGH_LEFT')
    expect(sites).toContain('THIGH_RIGHT')
    expect(sites).toContain('UPPER_ARM_LEFT')
    expect(sites).toContain('UPPER_ARM_RIGHT')
  })
})
