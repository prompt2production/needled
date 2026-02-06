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

vi.mock('@/lib/api-auth', () => ({
  authenticateRequest: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/api-auth'

const mockAuthenticateRequest = vi.mocked(authenticateRequest)
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
    mockAuthenticateRequest.mockResolvedValue(null)

    const request = createPutRequest(validInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should return 401 for invalid session', async () => {
    mockAuthenticateRequest.mockResolvedValue(null)

    const request = createPutRequest(validInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should update profile for authenticated user', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
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
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserUpdate.mockResolvedValue(mockUpdatedUserResponse as never)

    const request = createPutRequest(validInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.passwordHash).toBeUndefined()
  })

  it('should call prisma.user.update with correct data', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
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
        currentDosage: undefined,
        height: undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        goalWeight: true,
        weightUnit: true,
        medication: true,
        injectionDay: true,
        currentDosage: true,
        height: true,
      },
    })
  })

  it('should return 400 for invalid name', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })

    const invalidInput = { ...validInput, name: 'A' } // Too short
    const request = createPutRequest(invalidInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(Array.isArray(data.error)).toBe(true)
  })

  it('should return 400 for invalid medication', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })

    const invalidInput = { ...validInput, medication: 'INVALID' }
    const request = createPutRequest(invalidInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 400 for invalid injection day', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })

    const invalidInput = { ...validInput, injectionDay: 7 } // Out of range
    const request = createPutRequest(invalidInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should allow null goalWeight', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserUpdate.mockResolvedValue({ ...mockUpdatedUserResponse, goalWeight: null } as never)

    const inputWithNullGoal = { ...validInput, goalWeight: null }
    const request = createPutRequest(inputWithNullGoal)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.goalWeight).toBeNull()
  })

  it('should return 500 on database error', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserUpdate.mockRejectedValue(new Error('Database error'))

    const request = createPutRequest(validInput)
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
    mockUserUpdate.mockResolvedValue(mockUpdatedUserResponse as never)

    const request = new NextRequest('http://localhost:3000/api/settings/profile', {
      method: 'PUT',
      body: JSON.stringify(validInput),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer bearer-token',
      },
    })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.name).toBe('Updated Name')
  })
})
