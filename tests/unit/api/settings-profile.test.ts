import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PUT } from '@/app/api/settings/profile/route'
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
}))

import { prisma } from '@/lib/prisma'
import { getSessionToken } from '@/lib/cookies'
import { validateSession } from '@/lib/auth'

const mockGetSessionToken = vi.mocked(getSessionToken)
const mockValidateSession = vi.mocked(validateSession)
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
  name: 'Updated Name',
  goalWeight: 70,
  medication: 'WEGOVY',
  injectionDay: 2,
}

const mockUpdatedUserResponse = {
  id: 'user123',
  name: 'Updated Name',
  email: 'test@example.com',
  goalWeight: 70,
  weightUnit: 'kg',
  medication: 'WEGOVY',
  injectionDay: 2,
}

function createPutRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/settings/profile', {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('PUT /api/settings/profile', () => {
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

  it('should update profile for authenticated user', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockUserUpdate.mockResolvedValue(mockUpdatedUserResponse as never)

    const request = createPutRequest(validInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.name).toBe('Updated Name')
    expect(data.goalWeight).toBe(70)
    expect(data.medication).toBe('WEGOVY')
    expect(data.injectionDay).toBe(2)
  })

  it('should NOT return passwordHash in response', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockUserUpdate.mockResolvedValue(mockUpdatedUserResponse as never)

    const request = createPutRequest(validInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.passwordHash).toBeUndefined()
  })

  it('should call prisma.user.update with correct data', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockUserUpdate.mockResolvedValue(mockUpdatedUserResponse as never)

    const request = createPutRequest(validInput)
    await PUT(request)

    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user123' },
      data: {
        name: 'Updated Name',
        goalWeight: 70,
        medication: 'WEGOVY',
        injectionDay: 2,
      },
      select: {
        id: true,
        name: true,
        email: true,
        goalWeight: true,
        weightUnit: true,
        medication: true,
        injectionDay: true,
      },
    })
  })

  it('should return 400 for invalid name', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)

    const invalidInput = { ...validInput, name: 'A' } // Too short
    const request = createPutRequest(invalidInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(Array.isArray(data.error)).toBe(true)
  })

  it('should return 400 for invalid medication', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)

    const invalidInput = { ...validInput, medication: 'INVALID' }
    const request = createPutRequest(invalidInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 400 for invalid injection day', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)

    const invalidInput = { ...validInput, injectionDay: 7 } // Out of range
    const request = createPutRequest(invalidInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should allow null goalWeight', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockUserUpdate.mockResolvedValue({ ...mockUpdatedUserResponse, goalWeight: null } as never)

    const inputWithNullGoal = { ...validInput, goalWeight: null }
    const request = createPutRequest(inputWithNullGoal)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.goalWeight).toBeNull()
  })

  it('should return 500 on database error', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockUserUpdate.mockRejectedValue(new Error('Database error'))

    const request = createPutRequest(validInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
