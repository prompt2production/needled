import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/habits/route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    dailyHabit: {
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockFindMany = vi.mocked(prisma.dailyHabit.findMany)

function createGetRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost:3000/api/habits')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return new NextRequest(url, { method: 'GET' })
}

describe('GET /api/habits', () => {
  const mockHabits = [
    {
      id: 'habit1',
      userId: 'user123',
      date: new Date('2025-01-22'),
      water: true,
      nutrition: true,
      exercise: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'habit2',
      userId: 'user123',
      date: new Date('2025-01-21'),
      water: true,
      nutrition: false,
      exercise: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if userId is missing', async () => {
    const request = createGetRequest({})
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('userId is required')
  })

  it('should return habits for user without date filters', async () => {
    mockFindMany.mockResolvedValue(mockHabits as any)

    const request = createGetRequest({ userId: 'user123' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(2)
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: 'user123' },
      orderBy: { date: 'desc' },
    })
  })

  it('should filter by startDate', async () => {
    mockFindMany.mockResolvedValue([mockHabits[0]] as any)

    const request = createGetRequest({ userId: 'user123', startDate: '2025-01-22' })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        userId: 'user123',
        date: { gte: expect.any(Date) },
      },
      orderBy: { date: 'desc' },
    })
  })

  it('should filter by endDate', async () => {
    mockFindMany.mockResolvedValue([mockHabits[1]] as any)

    const request = createGetRequest({ userId: 'user123', endDate: '2025-01-21' })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        userId: 'user123',
        date: { lte: expect.any(Date) },
      },
      orderBy: { date: 'desc' },
    })
  })

  it('should filter by both startDate and endDate', async () => {
    mockFindMany.mockResolvedValue(mockHabits as any)

    const request = createGetRequest({
      userId: 'user123',
      startDate: '2025-01-20',
      endDate: '2025-01-23',
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        userId: 'user123',
        date: { gte: expect.any(Date), lte: expect.any(Date) },
      },
      orderBy: { date: 'desc' },
    })
  })

  it('should return empty array when no habits exist', async () => {
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
