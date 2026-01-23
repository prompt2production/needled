import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, generateSessionToken } from '@/lib/auth'

describe('hashPassword', () => {
  it('should hash a password', async () => {
    const password = 'mysecretpassword123'
    const hash = await hashPassword(password)

    expect(hash).toBeDefined()
    expect(typeof hash).toBe('string')
    expect(hash).not.toBe(password)
    // bcrypt hashes start with $2b$ (or $2a$)
    expect(hash).toMatch(/^\$2[ab]\$/)
  })

  it('should generate different hashes for the same password', async () => {
    const password = 'samepassword'
    const hash1 = await hashPassword(password)
    const hash2 = await hashPassword(password)

    expect(hash1).not.toBe(hash2)
  })

  it('should use cost factor 12', async () => {
    const password = 'testpassword'
    const hash = await hashPassword(password)

    // bcrypt format: $2b$12$... where 12 is the cost factor
    expect(hash).toMatch(/^\$2[ab]\$12\$/)
  })
})

describe('verifyPassword', () => {
  it('should return true for correct password', async () => {
    const password = 'correctpassword'
    const hash = await hashPassword(password)

    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)
  })

  it('should return false for incorrect password', async () => {
    const password = 'correctpassword'
    const hash = await hashPassword(password)

    const isValid = await verifyPassword('wrongpassword', hash)
    expect(isValid).toBe(false)
  })

  it('should return false for empty password', async () => {
    const password = 'somepassword'
    const hash = await hashPassword(password)

    const isValid = await verifyPassword('', hash)
    expect(isValid).toBe(false)
  })
})

describe('generateSessionToken', () => {
  it('should generate a 64-character hex string (32 bytes)', () => {
    const token = generateSessionToken()

    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
    expect(token.length).toBe(64)
    // Should only contain hex characters
    expect(token).toMatch(/^[0-9a-f]+$/)
  })

  it('should generate unique tokens', () => {
    const tokens = new Set<string>()
    for (let i = 0; i < 100; i++) {
      tokens.add(generateSessionToken())
    }

    expect(tokens.size).toBe(100)
  })
})
