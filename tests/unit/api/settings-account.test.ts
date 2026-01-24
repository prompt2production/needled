import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DELETE } from '@/app/api/settings/account/route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/lib/cookies', () => ({
  getSessionToken: vi.fn(),
  clearSessionCookie: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  validateSession: vi.fn(),
  verifyPassword: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { getSessionToken, clearSessionCookie } from '@/lib/cookies'
import { validateSession, verifyPassword } from '@/lib/auth'

const mockGetSessionToken = vi.mocked(getSessionToken)
const mockClearSessionCookie = vi.mocked(clearSessionCookie)
const mockValidateSession = vi.mocked(validateSession)
const mockVerifyPassword = vi.mocked(verifyPassword)
const mockUserDelete = vi.mocked(prisma.user.delete)

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

function createDeleteRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/settings/account', {
    method: 'DELETE',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('DELETE /api/settings/account', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 without auth token', async () => {
    mockGetSessionToken.mockResolvedValue(null)

    const request = createDeleteRequest({ password: 'mypassword' })
    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should return 401 for invalid session', async () => {
    mockGetSessionToken.mockResolvedValue('invalid-token')
    mockValidateSession.mockResolvedValue(null)

    const request = createDeleteRequest({ password: 'mypassword' })
    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should delete account successfully with correct password', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockVerifyPassword.mockResolvedValue(true)
    mockUserDelete.mockResolvedValue(mockUser as never)
    mockClearSessionCookie.mockResolvedValue(undefined)

    const request = createDeleteRequest({ password: 'correctpassword' })
    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Account deleted successfully')
    expect(mockUserDelete).toHaveBeenCalledWith({
      where: { id: 'user123' },
    })
    expect(mockClearSessionCookie).toHaveBeenCalled()
  })

  it('should return 400 if password is incorrect', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockVerifyPassword.mockResolvedValue(false)

    const request = createDeleteRequest({ password: 'wrongpassword' })
    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Incorrect password')
    expect(mockUserDelete).not.toHaveBeenCalled()
  })

  it('should return 400 if user has no password set', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue({ ...mockUser, passwordHash: null } as never)

    const request = createDeleteRequest({ password: 'anypassword' })
    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Password not set for this account')
    expect(mockUserDelete).not.toHaveBeenCalled()
  })

  it('should return 400 for missing password field', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)

    const request = createDeleteRequest({})
    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(Array.isArray(data.error)).toBe(true)
  })

  it('should return 400 for empty password', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)

    const request = createDeleteRequest({ password: '' })
    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should clear session cookie on successful deletion', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockVerifyPassword.mockResolvedValue(true)
    mockUserDelete.mockResolvedValue(mockUser as never)
    mockClearSessionCookie.mockResolvedValue(undefined)

    const request = createDeleteRequest({ password: 'correctpassword' })
    await DELETE(request)

    expect(mockClearSessionCookie).toHaveBeenCalledTimes(1)
  })

  it('should return 500 on database error', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockVerifyPassword.mockResolvedValue(true)
    mockUserDelete.mockRejectedValue(new Error('Database error'))

    const request = createDeleteRequest({ password: 'correctpassword' })
    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
