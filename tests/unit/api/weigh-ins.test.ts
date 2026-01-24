import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET, POST } from '@/app/api/weigh-ins/route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    weighIn: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockCreate = vi.mocked(prisma.weighIn.create)
const mockFindMany = vi.mocked(prisma.weighIn.findMany)

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
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-24T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
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

  it('should allow multiple weigh-ins in the same week (no 409 conflict)', async () => {
    mockCreate.mockResolvedValue(mockWeighIn)

    // Create first weigh-in
    const request1 = createRequest(validData)
    const response1 = await POST(request1)
    expect(response1.status).toBe(201)

    // Create second weigh-in in the same week - should succeed
    const request2 = createRequest(validData)
    const response2 = await POST(request2)
    expect(response2.status).toBe(201)
  })

  it('should accept optional date parameter', async () => {
    mockCreate.mockResolvedValue(mockWeighIn)

    const request = createRequest({ ...validData, date: '2026-01-20' })
    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user123',
        weight: 85,
        date: new Date('2026-01-20T12:00:00Z'),
      }),
    })
  })

  it('should default to current date when date not provided', async () => {
    mockCreate.mockResolvedValue(mockWeighIn)

    const request = createRequest(validData)
    await POST(request)

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        date: expect.any(Date),
      }),
    })
  })

  it('should return 400 for invalid date (future date)', async () => {
    const request = createRequest({ ...validData, date: '2026-01-25' })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 400 for invalid date (too far in past)', async () => {
    const request = createRequest({ ...validData, date: '2025-01-01' })
    const response = await POST(request)

    expect(response.status).toBe(400)
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

describe('GET /api/weigh-ins', () => {
  const mockWeighIns = [
    {
      id: 'weighin1',
      userId: 'user123',
      weight: 85,
      date: new Date('2025-01-20'),
      createdAt: new Date('2025-01-20'),
    },
    {
      id: 'weighin2',
      userId: 'user123',
      weight: 84,
      date: new Date('2025-01-13'),
      createdAt: new Date('2025-01-13'),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockFindMany.mockResolvedValue(mockWeighIns)
  })

  function createGetRequest(params: Record<string, string>): NextRequest {
    const url = new URL('http://localhost:3000/api/weigh-ins')
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
    return new NextRequest(url, { method: 'GET' })
  }

  it('should return 200 with array of weigh-ins', async () => {
    const request = createGetRequest({ userId: 'user123' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(2)
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: 'user123' },
      orderBy: { date: 'desc' },
      take: 10,
      skip: 0,
    })
  })

  it('should return 400 if userId is missing', async () => {
    const request = createGetRequest({})
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('userId is required')
  })

  it('should support limit parameter', async () => {
    const request = createGetRequest({ userId: 'user123', limit: '5' })
    await GET(request)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 })
    )
  })

  it('should support offset parameter', async () => {
    const request = createGetRequest({ userId: 'user123', offset: '10' })
    await GET(request)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10 })
    )
  })

  it('should cap limit at 100', async () => {
    const request = createGetRequest({ userId: 'user123', limit: '200' })
    await GET(request)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    )
  })

  it('should return empty array when no weigh-ins exist', async () => {
    mockFindMany.mockResolvedValue([])

    const request = createGetRequest({ userId: 'user123' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([])
  })

  it('should return 500 on database error', async () => {
    mockFindMany.mockRejectedValue(new Error('Database error'))

    const request = createGetRequest({ userId: 'user123' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
