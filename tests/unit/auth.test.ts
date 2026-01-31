import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hashPassword, verifyPassword, generateSessionToken, createSession, validateSession, deleteSession } from '@/lib/auth'

// Mock Prisma for session tests
vi.mock('@/lib/prisma', () => ({
  prisma: {
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockSessionCreate = vi.mocked(prisma.session.create)
const mockSessionFindUnique = vi.mocked(prisma.session.findUnique)
const mockSessionDelete = vi.mocked(prisma.session.delete)

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

describe('createSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a session and return token', async () => {
    const userId = 'user123'
    mockSessionCreate.mockResolvedValue({
      id: 'session123',
      token: 'generated-token',
      userId,
      expiresAt: new Date(),
      createdAt: new Date(),
    })

    const token = await createSession(userId)

    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
    expect(token.length).toBe(64) // 32 bytes = 64 hex chars
    expect(mockSessionCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId,
        token: expect.any(String),
        expiresAt: expect.any(Date),
      }),
    })
  })

  it('should set expiry to ~10 years from now (mobile app persistent login)', async () => {
    const userId = 'user123'
    let capturedExpiresAt: Date | null = null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockSessionCreate.mockImplementation(async ({ data }: any) => {
      capturedExpiresAt = data.expiresAt as Date
      return {
        id: 'session123',
        token: data.token,
        userId: data.userId,
        expiresAt: data.expiresAt as Date,
        createdAt: new Date(),
      }
    })

    await createSession(userId)

    expect(capturedExpiresAt).not.toBeNull()
    const now = new Date()
    const tenYearsFromNow = new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000)
    // Allow 1 minute tolerance
    const diff = Math.abs(capturedExpiresAt!.getTime() - tenYearsFromNow.getTime())
    expect(diff).toBeLessThan(60 * 1000)
  })
})

describe('validateSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return user for valid session', async () => {
    const mockUser = {
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      startWeight: 85,
      goalWeight: 75,
      weightUnit: 'kg',
      medication: 'OZEMPIC',
      injectionDay: 0,
      currentDosage: null,
      height: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 10) // 10 days in future

    mockSessionFindUnique.mockResolvedValue({
      id: 'session123',
      token: 'valid-token',
      userId: 'user123',
      expiresAt: futureDate,
      createdAt: new Date(),
      user: mockUser,
    } as never)

    const user = await validateSession('valid-token')

    expect(user).toEqual(mockUser)
    expect(mockSessionFindUnique).toHaveBeenCalledWith({
      where: { token: 'valid-token' },
      include: { user: true },
    })
  })

  it('should return null for non-existent session', async () => {
    mockSessionFindUnique.mockResolvedValue(null)

    const user = await validateSession('invalid-token')

    expect(user).toBeNull()
  })

  it('should return null and delete expired session', async () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1) // 1 day in past

    mockSessionFindUnique.mockResolvedValue({
      id: 'session123',
      token: 'expired-token',
      userId: 'user123',
      expiresAt: pastDate,
      createdAt: new Date(),
      user: { id: 'user123', name: 'Test' },
    } as never)

    const user = await validateSession('expired-token')

    expect(user).toBeNull()
    expect(mockSessionDelete).toHaveBeenCalledWith({ where: { id: 'session123' } })
  })
})

describe('deleteSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete session by token', async () => {
    mockSessionDelete.mockResolvedValue({
      id: 'session123',
      token: 'token-to-delete',
      userId: 'user123',
      expiresAt: new Date(),
      createdAt: new Date(),
    })

    await deleteSession('token-to-delete')

    expect(mockSessionDelete).toHaveBeenCalledWith({ where: { token: 'token-to-delete' } })
  })

  it('should not throw if session does not exist', async () => {
    mockSessionDelete.mockRejectedValue(new Error('Record not found'))

    // Should not throw
    await expect(deleteSession('non-existent-token')).resolves.toBeUndefined()
  })
})
