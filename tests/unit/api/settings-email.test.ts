import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PUT } from '@/app/api/settings/email/route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/api-auth', () => ({
  authenticateRequest: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/api-auth'

const mockAuthenticateRequest = vi.mocked(authenticateRequest)
const mockUserFindUnique = vi.mocked(prisma.user.findUnique)
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

function createPutRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/settings/email', {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('PUT /api/settings/email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 without auth token', async () => {
    mockAuthenticateRequest.mockResolvedValue(null)

    const request = createPutRequest({ email: 'newemail@example.com' })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should return 401 for invalid session', async () => {
    mockAuthenticateRequest.mockResolvedValue(null)

    const request = createPutRequest({ email: 'newemail@example.com' })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should update email successfully', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserFindUnique.mockResolvedValue(null) // No existing user with this email
    mockUserUpdate.mockResolvedValue(mockUser as never)

    const request = createPutRequest({ email: 'newemail@example.com' })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Email updated successfully')
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user123' },
      data: { email: 'newemail@example.com' },
    })
  })

  it('should allow keeping the same email', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    // Return the same user when checking for existing email
    mockUserFindUnique.mockResolvedValue(mockUser as never)
    mockUserUpdate.mockResolvedValue(mockUser as never)

    const request = createPutRequest({ email: 'test@example.com' })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Email updated successfully')
  })

  it('should return 409 if email is already in use by another user', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    // Return a different user with this email
    mockUserFindUnique.mockResolvedValue({
      ...mockUser,
      id: 'differentUser',
      email: 'taken@example.com',
    } as never)

    const request = createPutRequest({ email: 'taken@example.com' })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('Email already in use')
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  it('should return 400 for invalid email format', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })

    const request = createPutRequest({ email: 'not-an-email' })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(Array.isArray(data.error)).toBe(true)
  })

  it('should return 400 for empty email', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })

    const request = createPutRequest({ email: '' })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 400 for missing email field', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })

    const request = createPutRequest({})
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 500 on database error', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserFindUnique.mockRejectedValue(new Error('Database error'))

    const request = createPutRequest({ email: 'newemail@example.com' })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  it('should work with Bearer token authentication', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'bearer-token',
      source: 'bearer',
    })
    mockUserFindUnique.mockResolvedValue(null)
    mockUserUpdate.mockResolvedValue(mockUser as never)

    const request = new NextRequest('http://localhost:3000/api/settings/email', {
      method: 'PUT',
      body: JSON.stringify({ email: 'newemail@example.com' }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer bearer-token',
      },
    })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Email updated successfully')
  })
})
