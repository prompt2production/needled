import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/users/route'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  hashPassword: vi.fn(),
  createSession: vi.fn(),
}))

vi.mock('@/lib/cookies', () => ({
  setSessionCookie: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { hashPassword, createSession } from '@/lib/auth'
import { setSessionCookie } from '@/lib/cookies'

const mockCreate = vi.mocked(prisma.user.create)
const mockHashPassword = vi.mocked(hashPassword)
const mockCreateSession = vi.mocked(createSession)
const mockSetSessionCookie = vi.mocked(setSessionCookie)

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/users', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/users', () => {
  const validData = {
    name: 'John',
    email: 'john@example.com',
    password: 'password123',
    startWeight: 85,
    goalWeight: 75,
    weightUnit: 'kg',
    medication: 'OZEMPIC',
    injectionDay: 0,
  }

  const mockUser = {
    id: 'cuid123',
    name: 'John',
    email: 'john@example.com',
    passwordHash: 'hashed-password',
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
    mockHashPassword.mockResolvedValue('hashed-password')
    mockCreateSession.mockResolvedValue('session-token')
    mockSetSessionCookie.mockResolvedValue(undefined)
  })

  it('should return 201 with created user on success', async () => {
    mockCreate.mockResolvedValue(mockUser)

    const request = createRequest(validData)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.id).toBe('cuid123')
    expect(data.name).toBe('John')
    expect(data.email).toBe('john@example.com')
    expect(data.passwordHash).toBeUndefined()
    expect(mockHashPassword).toHaveBeenCalledWith('password123')
    expect(mockCreateSession).toHaveBeenCalledWith('cuid123')
    expect(mockSetSessionCookie).toHaveBeenCalledWith('session-token')
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        name: 'John',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        startWeight: 85,
        goalWeight: 75,
        weightUnit: 'kg',
        medication: 'OZEMPIC',
        injectionDay: 0,
        currentDosage: null,
        height: null,
      },
    })
  })

  it('should return 201 with null goalWeight when not provided', async () => {
    const dataWithoutGoal = { ...validData, goalWeight: null }
    mockCreate.mockResolvedValue({ ...mockUser, goalWeight: null })

    const request = createRequest(dataWithoutGoal)
    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ goalWeight: null }),
    })
  })

  it('should return 400 with validation errors for invalid name', async () => {
    const request = createRequest({ ...validData, name: 'A' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(Array.isArray(data.error)).toBe(true)
  })

  it('should return 400 with validation errors for invalid email', async () => {
    const request = createRequest({ ...validData, email: 'not-an-email' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 400 with validation errors for short password', async () => {
    const request = createRequest({ ...validData, password: 'short' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 400 with validation errors for invalid weight', async () => {
    const request = createRequest({ ...validData, startWeight: 10 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 400 with validation errors for invalid medication', async () => {
    const request = createRequest({ ...validData, medication: 'INVALID' })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 400 with validation errors for invalid injection day', async () => {
    const request = createRequest({ ...validData, injectionDay: 7 })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 400 when goalWeight >= startWeight', async () => {
    const request = createRequest({ ...validData, goalWeight: 90 })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 409 when email already exists', async () => {
    const uniqueConstraintError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      { code: 'P2002', clientVersion: '5.0.0' }
    )
    mockCreate.mockRejectedValue(uniqueConstraintError)

    const request = createRequest(validData)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('Email already exists')
  })

  it('should return 500 on database error', async () => {
    mockCreate.mockRejectedValue(new Error('Database connection failed'))

    const request = createRequest(validData)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
