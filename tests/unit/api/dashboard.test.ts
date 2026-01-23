import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/dashboard/route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    weighIn: {
      count: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockFindUnique = vi.mocked(prisma.user.findUnique)
const mockWeighInCount = vi.mocked(prisma.weighIn.count)

function createGetRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost:3000/api/dashboard')
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  return new NextRequest(url, { method: 'GET' })
}

const mockUser = {
  id: 'user123',
  name: 'Test User',
  startWeight: 100,
  goalWeight: 80,
  weightUnit: 'kg',
  medication: 'OZEMPIC',
  injectionDay: 1,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date(),
  weighIns: [],
  dailyHabits: [],
}

describe('GET /api/dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWeighInCount.mockResolvedValue(0)
  })

  it('should return 400 if userId is missing', async () => {
    const request = createGetRequest({})
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 400 if userId is empty', async () => {
    const request = createGetRequest({ userId: '' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 404 if user not found', async () => {
    mockFindUnique.mockResolvedValue(null)

    const request = createGetRequest({ userId: 'nonexistent' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('should return dashboard data for valid user', async () => {
    mockFindUnique.mockResolvedValue(mockUser as never)

    const request = createGetRequest({ userId: 'user123' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user.id).toBe('user123')
    expect(data.user.name).toBe('Test User')
    expect(data.user.startWeight).toBe(100)
    expect(data.user.goalWeight).toBe(80)
    expect(data.weight).toBeDefined()
    expect(data.habits).toBeDefined()
    expect(data.journey).toBeDefined()
  })

  describe('progress percentage calculation', () => {
    it('should return progressPercent as 0 when user has no weigh-ins', async () => {
      mockFindUnique.mockResolvedValue({
        ...mockUser,
        weighIns: [],
      } as never)

      const request = createGetRequest({ userId: 'user123' })
      const response = await GET(request)
      const data = await response.json()

      expect(data.weight.progressPercent).toBe(0)
    })

    it('should return progressPercent as null when user has no goal weight', async () => {
      mockFindUnique.mockResolvedValue({
        ...mockUser,
        goalWeight: null,
        weighIns: [{ id: 'w1', weight: 95, date: new Date(), createdAt: new Date() }],
      } as never)

      const request = createGetRequest({ userId: 'user123' })
      const response = await GET(request)
      const data = await response.json()

      expect(data.weight.progressPercent).toBeNull()
    })

    it('should calculate progressPercent correctly with weigh-ins', async () => {
      // User started at 100, goal is 80, current is 90
      // Lost 10 out of 20 needed = 50%
      mockFindUnique.mockResolvedValue({
        ...mockUser,
        weighIns: [{ id: 'w1', weight: 90, date: new Date(), createdAt: new Date() }],
      } as never)
      mockWeighInCount.mockResolvedValue(1)

      const request = createGetRequest({ userId: 'user123' })
      const response = await GET(request)
      const data = await response.json()

      expect(data.weight.progressPercent).toBe(50)
    })

    it('should cap progressPercent at 100 when goal is exceeded', async () => {
      // User started at 100, goal is 80, current is 70 (exceeded goal)
      mockFindUnique.mockResolvedValue({
        ...mockUser,
        weighIns: [{ id: 'w1', weight: 70, date: new Date(), createdAt: new Date() }],
      } as never)
      mockWeighInCount.mockResolvedValue(1)

      const request = createGetRequest({ userId: 'user123' })
      const response = await GET(request)
      const data = await response.json()

      expect(data.weight.progressPercent).toBe(100)
    })

    it('should return progressPercent as 0 when user has gained weight', async () => {
      // User started at 100, goal is 80, current is 105 (gained weight)
      mockFindUnique.mockResolvedValue({
        ...mockUser,
        weighIns: [{ id: 'w1', weight: 105, date: new Date(), createdAt: new Date() }],
      } as never)
      mockWeighInCount.mockResolvedValue(1)

      const request = createGetRequest({ userId: 'user123' })
      const response = await GET(request)
      const data = await response.json()

      expect(data.weight.progressPercent).toBe(0)
    })
  })

  describe('week number calculation', () => {
    it('should return weekNumber as positive integer', async () => {
      mockFindUnique.mockResolvedValue(mockUser as never)

      const request = createGetRequest({ userId: 'user123' })
      const response = await GET(request)
      const data = await response.json()

      expect(data.journey.weekNumber).toBeGreaterThan(0)
      expect(Number.isInteger(data.journey.weekNumber)).toBe(true)
    })

    it('should return week 1 for user created this week', async () => {
      // Create user date that's in the same week as "now"
      const now = new Date()
      const dayOfWeek = now.getDay()
      // Calculate the Monday of this week
      const monday = new Date(now)
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
      monday.setHours(0, 0, 0, 0)

      mockFindUnique.mockResolvedValue({
        ...mockUser,
        createdAt: monday,
      } as never)

      const request = createGetRequest({ userId: 'user123' })
      const response = await GET(request)
      const data = await response.json()

      expect(data.journey.weekNumber).toBe(1)
    })

    it('should return journey.startDate as ISO string', async () => {
      mockFindUnique.mockResolvedValue(mockUser as never)

      const request = createGetRequest({ userId: 'user123' })
      const response = await GET(request)
      const data = await response.json()

      expect(typeof data.journey.startDate).toBe('string')
      expect(() => new Date(data.journey.startDate)).not.toThrow()
    })
  })

  describe('habit completion percentage calculation', () => {
    it('should return 0 when no habits logged this week', async () => {
      mockFindUnique.mockResolvedValue({
        ...mockUser,
        dailyHabits: [],
      } as never)

      const request = createGetRequest({ userId: 'user123' })
      const response = await GET(request)
      const data = await response.json()

      expect(data.habits.weeklyCompletionPercent).toBe(0)
    })

    it('should calculate habit completion based on completed habits', async () => {
      // Get start of current week (Monday)
      const now = new Date()
      const dayOfWeek = now.getDay()
      const monday = new Date(now)
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
      monday.setHours(0, 0, 0, 0)

      mockFindUnique.mockResolvedValue({
        ...mockUser,
        dailyHabits: [
          {
            id: 'h1',
            userId: 'user123',
            date: monday,
            water: true,
            nutrition: true,
            exercise: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      } as never)

      const request = createGetRequest({ userId: 'user123' })
      const response = await GET(request)
      const data = await response.json()

      // Should have some percentage > 0 since 2 of 3 habits completed on one day
      expect(data.habits.weeklyCompletionPercent).toBeGreaterThan(0)
    })
  })

  describe('weight data', () => {
    it('should return currentWeight as null when no weigh-ins', async () => {
      mockFindUnique.mockResolvedValue({
        ...mockUser,
        weighIns: [],
      } as never)

      const request = createGetRequest({ userId: 'user123' })
      const response = await GET(request)
      const data = await response.json()

      expect(data.weight.currentWeight).toBeNull()
      expect(data.weight.weekChange).toBeNull()
      expect(data.weight.totalLost).toBeNull()
    })

    it('should calculate weekChange between last two weigh-ins', async () => {
      mockFindUnique.mockResolvedValue({
        ...mockUser,
        weighIns: [
          { id: 'w1', weight: 90, date: new Date(), createdAt: new Date() },
          { id: 'w2', weight: 92, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), createdAt: new Date() },
        ],
      } as never)
      mockWeighInCount.mockResolvedValue(2)

      const request = createGetRequest({ userId: 'user123' })
      const response = await GET(request)
      const data = await response.json()

      expect(data.weight.currentWeight).toBe(90)
      expect(data.weight.previousWeight).toBe(92)
      expect(data.weight.weekChange).toBe(-2) // Lost 2kg
    })

    it('should calculate totalLost from startWeight', async () => {
      mockFindUnique.mockResolvedValue({
        ...mockUser,
        startWeight: 100,
        weighIns: [{ id: 'w1', weight: 95, date: new Date(), createdAt: new Date() }],
      } as never)
      mockWeighInCount.mockResolvedValue(1)

      const request = createGetRequest({ userId: 'user123' })
      const response = await GET(request)
      const data = await response.json()

      expect(data.weight.totalLost).toBe(5) // 100 - 95
    })

    it('should return weighInCount correctly', async () => {
      mockFindUnique.mockResolvedValue({
        ...mockUser,
        weighIns: [{ id: 'w1', weight: 90, date: new Date(), createdAt: new Date() }],
      } as never)
      mockWeighInCount.mockResolvedValue(5)

      const request = createGetRequest({ userId: 'user123' })
      const response = await GET(request)
      const data = await response.json()

      expect(data.weight.weighInCount).toBe(5)
    })
  })

  it('should return 500 on database error', async () => {
    mockFindUnique.mockRejectedValue(new Error('Database error'))

    const request = createGetRequest({ userId: 'user123' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
