import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/settings/route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
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
  expoPushToken: null,
  pushTokenPlatform: null,
  pushTokenUpdatedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockUserResponse = {
  id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  goalWeight: 75,
  weightUnit: 'kg',
  medication: 'OZEMPIC',
  injectionDay: 0,
}

function createGetRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/settings', {
    method: 'GET',
  })
}

describe('GET /api/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 without auth token', async () => {
    mockAuthenticateRequest.mockResolvedValue(null)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should return 401 for invalid session', async () => {
    mockAuthenticateRequest.mockResolvedValue(null)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should return user settings for authenticated user', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserFindUnique.mockResolvedValue(mockUserResponse as never)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockUserResponse)
  })

  it('should NOT return passwordHash in response', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserFindUnique.mockResolvedValue(mockUserResponse as never)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.passwordHash).toBeUndefined()
  })

  it('should return correct data shape', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserFindUnique.mockResolvedValue(mockUserResponse as never)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('id')
    expect(data).toHaveProperty('name')
    expect(data).toHaveProperty('email')
    expect(data).toHaveProperty('goalWeight')
    expect(data).toHaveProperty('weightUnit')
    expect(data).toHaveProperty('medication')
    expect(data).toHaveProperty('injectionDay')
  })

  it('should return 404 if user not found in database', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserFindUnique.mockResolvedValue(null)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('should return 500 on database error', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserFindUnique.mockRejectedValue(new Error('Database error'))

    const request = createGetRequest()
    const response = await GET(request)
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
    mockUserFindUnique.mockResolvedValue(mockUserResponse as never)

    const request = new NextRequest('http://localhost:3000/api/settings', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer bearer-token' },
    })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockUserResponse)
  })
})
