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

vi.mock('@/lib/api-auth', () => ({
  authenticateRequest: vi.fn(),
  getAuthToken: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  verifyPassword: vi.fn(),
}))

vi.mock('@/lib/cookies', () => ({
  clearSessionCookie: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { authenticateRequest, getAuthToken } from '@/lib/api-auth'
import { verifyPassword } from '@/lib/auth'
import { clearSessionCookie } from '@/lib/cookies'

const mockAuthenticateRequest = vi.mocked(authenticateRequest)
const mockGetAuthToken = vi.mocked(getAuthToken)
const mockClearSessionCookie = vi.mocked(clearSessionCookie)
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
  currentDosage: null,
  height: null,
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
    mockAuthenticateRequest.mockResolvedValue(null)

    const request = createDeleteRequest({ password: 'mypassword' })
    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should return 401 for invalid session', async () => {
    mockAuthenticateRequest.mockResolvedValue(null)

    const request = createDeleteRequest({ password: 'mypassword' })
    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should delete account successfully with correct password', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockGetAuthToken.mockResolvedValue({
      token: 'valid-token',
      source: 'cookie',
    })
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
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockVerifyPassword.mockResolvedValue(false)

    const request = createDeleteRequest({ password: 'wrongpassword' })
    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Incorrect password')
    expect(mockUserDelete).not.toHaveBeenCalled()
  })

  it('should return 400 if user has no password set', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: { ...mockUser, passwordHash: null },
      token: 'valid-token',
      source: 'cookie',
    })

    const request = createDeleteRequest({ password: 'anypassword' })
    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Password not set for this account')
    expect(mockUserDelete).not.toHaveBeenCalled()
  })

  it('should return 400 for missing password field', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })

    const request = createDeleteRequest({})
    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(Array.isArray(data.error)).toBe(true)
  })

  it('should return 400 for empty password', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })

    const request = createDeleteRequest({ password: '' })
    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should clear session cookie on successful deletion with cookie auth', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockGetAuthToken.mockResolvedValue({
      token: 'valid-token',
      source: 'cookie',
    })
    mockVerifyPassword.mockResolvedValue(true)
    mockUserDelete.mockResolvedValue(mockUser as never)
    mockClearSessionCookie.mockResolvedValue(undefined)

    const request = createDeleteRequest({ password: 'correctpassword' })
    await DELETE(request)

    expect(mockClearSessionCookie).toHaveBeenCalledTimes(1)
  })

  it('should NOT clear session cookie when using Bearer token auth', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'bearer-token',
      source: 'bearer',
    })
    mockGetAuthToken.mockResolvedValue({
      token: 'bearer-token',
      source: 'bearer',
    })
    mockVerifyPassword.mockResolvedValue(true)
    mockUserDelete.mockResolvedValue(mockUser as never)

    const request = new NextRequest('http://localhost:3000/api/settings/account', {
      method: 'DELETE',
      body: JSON.stringify({ password: 'correctpassword' }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer bearer-token',
      },
    })
    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Account deleted successfully')
    expect(mockClearSessionCookie).not.toHaveBeenCalled()
  })

  it('should return 500 on database error', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockVerifyPassword.mockResolvedValue(true)
    mockUserDelete.mockRejectedValue(new Error('Database error'))

    const request = createDeleteRequest({ password: 'correctpassword' })
    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
