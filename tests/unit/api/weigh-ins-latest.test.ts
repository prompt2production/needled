import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/weigh-ins/latest/route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    weighIn: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockUserFindUnique = vi.mocked(prisma.user.findUnique)
const mockWeighInFindMany = vi.mocked(prisma.weighIn.findMany)
const mockWeighInFindFirst = vi.mocked(prisma.weighIn.findFirst)

function createGetRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost:3000/api/weigh-ins/latest')
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  return new NextRequest(url, { method: 'GET' })
}

describe('GET /api/weigh-ins/latest', () => {
  const mockUser = { startWeight: 90 }

  const mockWeighIns = [
    {
      id: 'weighin1',
      userId: 'user123',
      weight: 85,
      date: new Date('2025-01-20'),
      createdAt: new Date('2025-01-20'),
      updatedAt: new Date('2025-01-20'),
    },
    {
      id: 'weighin2',
      userId: 'user123',
      weight: 87,
      date: new Date('2025-01-13'),
      createdAt: new Date('2025-01-13'),
      updatedAt: new Date('2025-01-13'),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUserFindUnique.mockResolvedValue(mockUser as any)
    mockWeighInFindMany.mockResolvedValue(mockWeighIns)
    mockWeighInFindFirst.mockResolvedValue(null) // No weigh-in this week by default
  })

  it('should return 400 if userId is missing', async () => {
    const request = createGetRequest({})
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('userId is required')
  })

  it('should return 404 if user not found', async () => {
    mockUserFindUnique.mockResolvedValue(null)

    const request = createGetRequest({ userId: 'nonexistent' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('should return latest weigh-in with trend data', async () => {
    const request = createGetRequest({ userId: 'user123' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.weighIn).toBeDefined()
    expect(data.weighIn.weight).toBe(85)
    expect(data.weekChange).toBe(-2) // 85 - 87
    expect(data.totalChange).toBe(-5) // 85 - 90
    expect(data.canWeighIn).toBe(true)
    expect(data.hasWeighedThisWeek).toBe(false) // No weigh-in this week by default
  })

  it('should return canWeighIn true and hasWeighedThisWeek true when weigh-in exists this week', async () => {
    mockWeighInFindFirst.mockResolvedValue(mockWeighIns[0])

    const request = createGetRequest({ userId: 'user123' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.canWeighIn).toBe(true) // Always true now
    expect(data.hasWeighedThisWeek).toBe(true)
  })

  it('should return hasWeighedThisWeek false when no weigh-in this week', async () => {
    mockWeighInFindFirst.mockResolvedValue(null)

    const request = createGetRequest({ userId: 'user123' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.canWeighIn).toBe(true)
    expect(data.hasWeighedThisWeek).toBe(false)
  })

  it('should return null for weighIn and weekChange when no history', async () => {
    mockWeighInFindMany.mockResolvedValue([])

    const request = createGetRequest({ userId: 'user123' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.weighIn).toBeNull()
    expect(data.weekChange).toBeNull()
    expect(data.totalChange).toBeNull()
    expect(data.canWeighIn).toBe(true)
    expect(data.hasWeighedThisWeek).toBe(false)
  })

  it('should return null weekChange when only one weigh-in exists', async () => {
    mockWeighInFindMany.mockResolvedValue([mockWeighIns[0]])

    const request = createGetRequest({ userId: 'user123' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.weighIn.weight).toBe(85)
    expect(data.weekChange).toBeNull()
    expect(data.totalChange).toBe(-5) // 85 - 90
  })

  it('should return 500 on database error', async () => {
    mockUserFindUnique.mockRejectedValue(new Error('Database error'))

    const request = createGetRequest({ userId: 'user123' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
