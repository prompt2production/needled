import { describe, it, expect } from 'vitest'
import { createInjectionSchema, injectionSiteEnum } from '@/lib/validations/injection'

describe('createInjectionSchema', () => {
  const validData = {
    userId: 'user123',
    site: 'ABDOMEN_LEFT' as const,
  }

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
