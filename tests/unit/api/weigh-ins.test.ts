import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/weigh-ins/route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    weighIn: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockCreate = vi.mocked(prisma.weighIn.create)
const mockFindFirst = vi.mocked(prisma.weighIn.findFirst)

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/weigh-ins', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/weigh-ins', () => {
  const validData = {
    userId: 'user123',
    weight: 85,
  }

  const mockWeighIn = {
    id: 'weighin123',
    userId: 'user123',
    weight: 85,
    date: new Date(),
    createdAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Default: no existing weigh-in this week
    mockFindFirst.mockResolvedValue(null)
  })

  it('should return 201 with created weigh-in on success', async () => {
    mockCreate.mockResolvedValue(mockWeighIn)

    const request = createRequest(validData)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.id).toBe('weighin123')
    expect(data.userId).toBe('user123')
    expect(data.weight).toBe(85)
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user123',
        weight: 85,
      }),
    })
  })

  it('should return 409 Conflict if weigh-in already exists for current week', async () => {
    mockFindFirst.mockResolvedValue(mockWeighIn)

    const request = createRequest(validData)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toContain('already logged')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('should return 400 with validation errors for missing userId', async () => {
    const request = createRequest({ weight: 85 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(Array.isArray(data.error)).toBe(true)
  })

  it('should return 400 with validation errors for empty userId', async () => {
    const request = createRequest({ userId: '', weight: 85 })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 400 with validation errors for weight below 40', async () => {
    const request = createRequest({ ...validData, weight: 39 })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 400 with validation errors for weight above 300', async () => {
    const request = createRequest({ ...validData, weight: 301 })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 400 with validation errors for negative weight', async () => {
    const request = createRequest({ ...validData, weight: -10 })
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
