import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/login/route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  verifyPassword: vi.fn(),
  createSession: vi.fn(),
}))

vi.mock('@/lib/cookies', () => ({
  setSessionCookie: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession } from '@/lib/auth'
import { setSessionCookie } from '@/lib/cookies'

const mockFindUnique = vi.mocked(prisma.user.findUnique)
const mockVerifyPassword = vi.mocked(verifyPassword)
const mockCreateSession = vi.mocked(createSession)
const mockSetSessionCookie = vi.mocked(setSessionCookie)

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/auth/login', () => {
  const validCredentials = {
    email: 'test@example.com',
    password: 'password123',
  }

  const mockUser = {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: 'hashedpassword123',
    startWeight: 85,
    goalWeight: 75,
    weightUnit: 'kg' as const,
    medication: 'OZEMPIC' as const,
    injectionDay: 0,
    currentDosage: null,
    height: null,
    expoPushToken: null,
    pushTokenPlatform: null,
    pushTokenUpdatedAt: null,
    dosingMode: 'STANDARD' as const,
    penStrengthMg: null,
    doseAmountMg: null,
    dosesPerPen: 4,
    tracksGoldenDose: false,
    currentDoseInPen: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 200 and user data on successful login', async () => {
    mockFindUnique.mockResolvedValue(mockUser)
    mockVerifyPassword.mockResolvedValue(true)
    mockCreateSession.mockResolvedValue('session-token-123')
    mockSetSessionCookie.mockResolvedValue(undefined)

    const response = await POST(createRequest(validCredentials))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.id).toBe('user123')
    expect(data.email).toBe('test@example.com')
    expect(data.passwordHash).toBeUndefined()
    expect(mockCreateSession).toHaveBeenCalledWith('user123')
    expect(mockSetSessionCookie).toHaveBeenCalledWith('session-token-123')
  })

  it('should return 401 for non-existent email', async () => {
    mockFindUnique.mockResolvedValue(null)

    const response = await POST(createRequest(validCredentials))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Invalid credentials')
  })

  it('should return 401 for wrong password', async () => {
    mockFindUnique.mockResolvedValue(mockUser)
    mockVerifyPassword.mockResolvedValue(false)

    const response = await POST(createRequest(validCredentials))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Invalid credentials')
  })

  it('should return 401 for user without passwordHash with helpful message', async () => {
    const userWithoutPassword = { ...mockUser, passwordHash: null }
    mockFindUnique.mockResolvedValue(userWithoutPassword)

    const response = await POST(createRequest(validCredentials))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toContain('Please create a new account')
  })

  it('should return 400 for invalid email format', async () => {
    const response = await POST(createRequest({
      email: 'invalid-email',
      password: 'password123',
    }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 400 for missing password', async () => {
    const response = await POST(createRequest({
      email: 'test@example.com',
    }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 400 for empty password', async () => {
    const response = await POST(createRequest({
      email: 'test@example.com',
      password: '',
    }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 500 on database error', async () => {
    mockFindUnique.mockRejectedValue(new Error('Database error'))

    const response = await POST(createRequest(validCredentials))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
