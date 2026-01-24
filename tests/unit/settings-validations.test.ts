import { describe, it, expect } from 'vitest'
import {
  profileUpdateSchema,
  emailUpdateSchema,
  passwordUpdateSchema,
  accountDeleteSchema,
} from '@/lib/validations/settings'

describe('profileUpdateSchema', () => {
  const validData = {
    name: 'John',
    goalWeight: 75,
    medication: 'OZEMPIC' as const,
    injectionDay: 0,
  }

  describe('name validation', () => {
    it('should accept valid name', () => {
      const result = profileUpdateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should trim whitespace from name', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, name: '  John  ' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('John')
      }
    })

    it('should reject name shorter than 2 characters', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, name: 'A' })
      expect(result.success).toBe(false)
    })

    it('should reject name longer than 30 characters', () => {
      const result = profileUpdateSchema.safeParse({
        ...validData,
        name: 'A'.repeat(31),
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty name after trimming', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, name: '   ' })
      expect(result.success).toBe(false)
    })
  })

  describe('goalWeight validation', () => {
    it('should accept valid goalWeight', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, goalWeight: 80 })
      expect(result.success).toBe(true)
    })

    it('should accept null goalWeight', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, goalWeight: null })
      expect(result.success).toBe(true)
    })

    it('should accept undefined goalWeight', () => {
      const { goalWeight, ...dataWithoutGoal } = validData
      const result = profileUpdateSchema.safeParse(dataWithoutGoal)
      expect(result.success).toBe(true)
    })

    it('should reject goalWeight below 40', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, goalWeight: 39 })
      expect(result.success).toBe(false)
    })

    it('should reject goalWeight above 300', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, goalWeight: 301 })
      expect(result.success).toBe(false)
    })

    it('should accept boundary value 40', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, goalWeight: 40 })
      expect(result.success).toBe(true)
    })

    it('should accept boundary value 300', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, goalWeight: 300 })
      expect(result.success).toBe(true)
    })
  })

  describe('medication validation', () => {
    it('should accept OZEMPIC', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, medication: 'OZEMPIC' })
      expect(result.success).toBe(true)
    })

    it('should accept WEGOVY', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, medication: 'WEGOVY' })
      expect(result.success).toBe(true)
    })

    it('should accept MOUNJARO', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, medication: 'MOUNJARO' })
      expect(result.success).toBe(true)
    })

    it('should accept ZEPBOUND', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, medication: 'ZEPBOUND' })
      expect(result.success).toBe(true)
    })

    it('should accept OTHER', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, medication: 'OTHER' })
      expect(result.success).toBe(true)
    })

    it('should reject invalid medication', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, medication: 'INVALID' })
      expect(result.success).toBe(false)
    })
  })

  describe('injectionDay validation', () => {
    it('should accept 0 (Monday)', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, injectionDay: 0 })
      expect(result.success).toBe(true)
    })

    it('should accept 6 (Sunday)', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, injectionDay: 6 })
      expect(result.success).toBe(true)
    })

    it('should reject negative day', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, injectionDay: -1 })
      expect(result.success).toBe(false)
    })

    it('should reject day greater than 6', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, injectionDay: 7 })
      expect(result.success).toBe(false)
    })

    it('should reject non-integer day', () => {
      const result = profileUpdateSchema.safeParse({ ...validData, injectionDay: 2.5 })
      expect(result.success).toBe(false)
    })
  })
})

describe('emailUpdateSchema', () => {
  it('should accept valid email', () => {
    const result = emailUpdateSchema.safeParse({ email: 'test@example.com' })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email format', () => {
    const result = emailUpdateSchema.safeParse({ email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('should reject empty email', () => {
    const result = emailUpdateSchema.safeParse({ email: '' })
    expect(result.success).toBe(false)
  })

  it('should reject email without domain', () => {
    const result = emailUpdateSchema.safeParse({ email: 'test@' })
    expect(result.success).toBe(false)
  })

  it('should reject email without @ symbol', () => {
    const result = emailUpdateSchema.safeParse({ email: 'testexample.com' })
    expect(result.success).toBe(false)
  })

  it('should reject missing email field', () => {
    const result = emailUpdateSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('passwordUpdateSchema', () => {
  const validData = {
    currentPassword: 'oldpassword',
    newPassword: 'newpassword123',
    confirmPassword: 'newpassword123',
  }

  describe('currentPassword validation', () => {
    it('should accept non-empty current password', () => {
      const result = passwordUpdateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty current password', () => {
      const result = passwordUpdateSchema.safeParse({ ...validData, currentPassword: '' })
      expect(result.success).toBe(false)
    })

    it('should reject missing current password', () => {
      const { currentPassword, ...dataWithoutCurrent } = validData
      const result = passwordUpdateSchema.safeParse(dataWithoutCurrent)
      expect(result.success).toBe(false)
    })
  })

  describe('newPassword validation', () => {
    it('should accept password with 8 or more characters', () => {
      const result = passwordUpdateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept password with exactly 8 characters', () => {
      const result = passwordUpdateSchema.safeParse({
        ...validData,
        newPassword: '12345678',
        confirmPassword: '12345678',
      })
      expect(result.success).toBe(true)
    })

    it('should reject password with less than 8 characters', () => {
      const result = passwordUpdateSchema.safeParse({
        ...validData,
        newPassword: '1234567',
        confirmPassword: '1234567',
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty new password', () => {
      const result = passwordUpdateSchema.safeParse({
        ...validData,
        newPassword: '',
        confirmPassword: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('confirmPassword validation', () => {
    it('should accept matching passwords', () => {
      const result = passwordUpdateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject non-matching passwords', () => {
      const result = passwordUpdateSchema.safeParse({
        ...validData,
        confirmPassword: 'differentpassword',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const confirmPasswordError = result.error.errors.find(
          (e) => e.path.includes('confirmPassword')
        )
        expect(confirmPasswordError).toBeDefined()
        expect(confirmPasswordError?.message).toBe('Passwords do not match')
      }
    })

    it('should reject empty confirm password', () => {
      const result = passwordUpdateSchema.safeParse({
        ...validData,
        confirmPassword: '',
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('accountDeleteSchema', () => {
  it('should accept non-empty password', () => {
    const result = accountDeleteSchema.safeParse({ password: 'mypassword' })
    expect(result.success).toBe(true)
  })

  it('should reject empty password', () => {
    const result = accountDeleteSchema.safeParse({ password: '' })
    expect(result.success).toBe(false)
  })

  it('should reject missing password field', () => {
    const result = accountDeleteSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('should provide helpful error message', () => {
    const result = accountDeleteSchema.safeParse({ password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const passwordError = result.error.errors.find((e) => e.path.includes('password'))
      expect(passwordError?.message).toBe('Password is required to delete account')
    }
  })
})
