import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/users/route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockCreate = vi.mocked(prisma.user.create)

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
    startWeight: 85,
    goalWeight: 75,
    weightUnit: 'kg',
    medication: 'OZEMPIC',
    injectionDay: 0,
  }

  const mockUser = {
    id: 'cuid123',
    name: 'John',
    startWeight: 85,
    goalWeight: 75,
    weightUnit: 'kg',
    medication: 'OZEMPIC',
    injectionDay: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 201 with created user on success', async () => {
    mockCreate.mockResolvedValue(mockUser)

    const request = createRequest(validData)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.id).toBe('cuid123')
    expect(data.name).toBe('John')
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        name: 'John',
        startWeight: 85,
        goalWeight: 75,
        weightUnit: 'kg',
        medication: 'OZEMPIC',
        injectionDay: 0,
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

  it('should return 500 on database error', async () => {
    mockCreate.mockRejectedValue(new Error('Database connection failed'))

    const request = createRequest(validData)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
