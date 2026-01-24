import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PUT } from '@/app/api/settings/password/route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/cookies', () => ({
  getSessionToken: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  validateSession: vi.fn(),
  verifyPassword: vi.fn(),
  hashPassword: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { getSessionToken } from '@/lib/cookies'
import { validateSession, verifyPassword, hashPassword } from '@/lib/auth'

const mockGetSessionToken = vi.mocked(getSessionToken)
const mockValidateSession = vi.mocked(validateSession)
const mockVerifyPassword = vi.mocked(verifyPassword)
const mockHashPassword = vi.mocked(hashPassword)
const mockUserUpdate = vi.mocked(prisma.user.update)

const mockUser = {
  id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  passwordHash: 'hashedpassword',
  startWeight: 85,
  goalWeight: 75,
  weightUnit: 'kg' as const,
  medication: 'OZEMPIC' as const,
  injectionDay: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const validInput = {
  currentPassword: 'oldpassword123',
  newPassword: 'newpassword123',
  confirmPassword: 'newpassword123',
}

function createPutRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/settings/password', {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('PUT /api/settings/password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 without auth token', async () => {
    mockGetSessionToken.mockResolvedValue(null)

    const request = createPutRequest(validInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should return 401 for invalid session', async () => {
    mockGetSessionToken.mockResolvedValue('invalid-token')
    mockValidateSession.mockResolvedValue(null)

    const request = createPutRequest(validInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should update password successfully', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockVerifyPassword.mockResolvedValue(true)
    mockHashPassword.mockResolvedValue('newhash')
    mockUserUpdate.mockResolvedValue(mockUser as never)

    const request = createPutRequest(validInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Password updated successfully')
    expect(mockHashPassword).toHaveBeenCalledWith('newpassword123')
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user123' },
      data: { passwordHash: 'newhash' },
    })
  })

  it('should return 400 if current password is incorrect', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockVerifyPassword.mockResolvedValue(false)

    const request = createPutRequest(validInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Current password is incorrect')
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  it('should return 400 if user has no password set', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue({ ...mockUser, passwordHash: null } as never)

    const request = createPutRequest(validInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Password not set for this account')
  })

  it('should return 400 for new password less than 8 characters', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)

    const invalidInput = {
      currentPassword: 'oldpassword123',
      newPassword: 'short',
      confirmPassword: 'short',
    }

    const request = createPutRequest(invalidInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(Array.isArray(data.error)).toBe(true)
  })

  it('should return 400 if passwords do not match', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)

    const invalidInput = {
      currentPassword: 'oldpassword123',
      newPassword: 'newpassword123',
      confirmPassword: 'differentpassword',
    }

    const request = createPutRequest(invalidInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 400 for missing current password', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)

    const invalidInput = {
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123',
    }

    const request = createPutRequest(invalidInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should NOT return any sensitive data on success', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockVerifyPassword.mockResolvedValue(true)
    mockHashPassword.mockResolvedValue('newhash')
    mockUserUpdate.mockResolvedValue(mockUser as never)

    const request = createPutRequest(validInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.passwordHash).toBeUndefined()
    expect(data.currentPassword).toBeUndefined()
    expect(data.newPassword).toBeUndefined()
  })

  it('should return 500 on database error', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockVerifyPassword.mockResolvedValue(true)
    mockHashPassword.mockResolvedValue('newhash')
    mockUserUpdate.mockRejectedValue(new Error('Database error'))

    const request = createPutRequest(validInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
