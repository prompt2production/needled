import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/injections/route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    injection: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockCreate = vi.mocked(prisma.injection.create)
const mockFindFirst = vi.mocked(prisma.injection.findFirst)
const mockFindMany = vi.mocked(prisma.injection.findMany)
const mockUserFindUnique = vi.mocked(prisma.user.findUnique)

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/injections', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/injections', () => {
  const validData = {
    userId: 'user123',
    site: 'ABDOMEN_LEFT',
  }

  const mockUser = {
    id: 'user123',
    name: 'Test User',
    startWeight: 100,
    goalWeight: 80,
    weightUnit: 'kg',
    medication: 'OZEMPIC',
    injectionDay: 2, // Wednesday
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockInjection = {
    id: 'injection123',
    userId: 'user123',
    site: 'ABDOMEN_LEFT',
    notes: null,
    date: new Date(),
    createdAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Default: user exists, no existing injection this week
    mockUserFindUnique.mockResolvedValue(mockUser as any)
    mockFindFirst.mockResolvedValue(null)
  })

  it('should return 201 with created injection on success', async () => {
    mockCreate.mockResolvedValue(mockInjection as any)

    const request = createRequest(validData)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.id).toBe('injection123')
    expect(data.userId).toBe('user123')
    expect(data.site).toBe('ABDOMEN_LEFT')
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user123',
        site: 'ABDOMEN_LEFT',
      }),
    })
  })

  it('should return 201 with injection including notes', async () => {
    const dataWithNotes = { ...validData, notes: 'Felt fine' }
    mockCreate.mockResolvedValue({ ...mockInjection, notes: 'Felt fine' } as any)

    const request = createRequest(dataWithNotes)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.notes).toBe('Felt fine')
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        notes: 'Felt fine',
      }),
    })
  })

  it('should return 409 Conflict if injection already exists for current injection week', async () => {
    mockFindFirst.mockResolvedValue(mockInjection as any)

    const request = createRequest(validData)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toContain('already logged')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('should return 404 if user not found', async () => {
    mockUserFindUnique.mockResolvedValue(null)

    const request = createRequest(validData)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('should return 400 with validation errors for missing userId', async () => {
    const request = createRequest({ site: 'ABDOMEN_LEFT' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(Array.isArray(data.error)).toBe(true)
  })

  it('should return 400 with validation errors for empty userId', async () => {
    const request = createRequest({ userId: '', site: 'ABDOMEN_LEFT' })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 400 with validation errors for missing site', async () => {
    const request = createRequest({ userId: 'user123' })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 400 with validation errors for invalid site', async () => {
    const request = createRequest({ userId: 'user123', site: 'INVALID_SITE' })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 400 with validation errors for notes exceeding 500 characters', async () => {
    const longNotes = 'a'.repeat(501)
    const request = createRequest({ ...validData, notes: longNotes })
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

describe('GET /api/injections', () => {
  const mockInjections = [
    {
      id: 'injection1',
      userId: 'user123',
      site: 'ABDOMEN_LEFT',
      notes: null,
      date: new Date('2025-01-20'),
      createdAt: new Date('2025-01-20'),
    },
    {
      id: 'injection2',
      userId: 'user123',
      site: 'ABDOMEN_RIGHT',
      notes: 'Second injection',
      date: new Date('2025-01-13'),
      createdAt: new Date('2025-01-13'),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockFindMany.mockResolvedValue(mockInjections as any)
  })

  function createGetRequest(params: Record<string, string>): NextRequest {
    const url = new URL('http://localhost:3000/api/injections')
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
    return new NextRequest(url, { method: 'GET' })
  }

  it('should return 200 with array of injections', async () => {
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

  it('should return empty array when no injections exist', async () => {
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
