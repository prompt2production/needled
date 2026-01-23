import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PATCH } from '@/app/api/habits/today/route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    dailyHabit: {
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
  },
}))

vi.mock('@/lib/habit-dates', () => ({
  getDateString: vi.fn(() => '2025-01-22'),
}))

import { prisma } from '@/lib/prisma'

const mockFindUnique = vi.mocked(prisma.dailyHabit.findUnique)
const mockCreate = vi.mocked(prisma.dailyHabit.create)
const mockUpsert = vi.mocked(prisma.dailyHabit.upsert)

function createGetRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost:3000/api/habits/today')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return new NextRequest(url, { method: 'GET' })
}

function createPatchRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/habits/today', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('GET /api/habits/today', () => {
  const mockHabit = {
    id: 'habit1',
    userId: 'user123',
    date: new Date('2025-01-22'),
    water: true,
    nutrition: false,
    exercise: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

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

  it('should return existing habit record for today', async () => {
    mockFindUnique.mockResolvedValue(mockHabit as any)

    const request = createGetRequest({ userId: 'user123' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.id).toBe('habit1')
    expect(data.water).toBe(true)
    expect(data.nutrition).toBe(false)
    expect(data.exercise).toBe(false)
  })

  it('should create new habit record if none exists for today', async () => {
    mockFindUnique.mockResolvedValue(null)
    const newHabit = {
      ...mockHabit,
      id: 'new-habit',
      water: false,
      nutrition: false,
      exercise: false,
    }
    mockCreate.mockResolvedValue(newHabit as any)

    const request = createGetRequest({ userId: 'user123' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.id).toBe('new-habit')
    expect(data.water).toBe(false)
    expect(data.nutrition).toBe(false)
    expect(data.exercise).toBe(false)
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        userId: 'user123',
        date: expect.any(Date),
        water: false,
        nutrition: false,
        exercise: false,
      },
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

describe('PATCH /api/habits/today', () => {
  const mockHabit = {
    id: 'habit1',
    userId: 'user123',
    date: new Date('2025-01-22'),
    water: true,
    nutrition: false,
    exercise: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should toggle water habit to true', async () => {
    mockUpsert.mockResolvedValue(mockHabit as any)

    const request = createPatchRequest({
      userId: 'user123',
      habit: 'water',
      value: true,
    })
    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.water).toBe(true)
    expect(mockUpsert).toHaveBeenCalledWith({
      where: {
        userId_date: {
          userId: 'user123',
          date: expect.any(Date),
        },
      },
      create: {
        userId: 'user123',
        date: expect.any(Date),
        water: true,
        nutrition: false,
        exercise: false,
      },
      update: {
        water: true,
      },
    })
  })

  it('should toggle nutrition habit to true', async () => {
    const updatedHabit = { ...mockHabit, nutrition: true }
    mockUpsert.mockResolvedValue(updatedHabit as any)

    const request = createPatchRequest({
      userId: 'user123',
      habit: 'nutrition',
      value: true,
    })
    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.nutrition).toBe(true)
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { nutrition: true },
      })
    )
  })

  it('should toggle exercise habit to true', async () => {
    const updatedHabit = { ...mockHabit, exercise: true }
    mockUpsert.mockResolvedValue(updatedHabit as any)

    const request = createPatchRequest({
      userId: 'user123',
      habit: 'exercise',
      value: true,
    })
    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.exercise).toBe(true)
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { exercise: true },
      })
    )
  })

  it('should toggle habit to false', async () => {
    const updatedHabit = { ...mockHabit, water: false }
    mockUpsert.mockResolvedValue(updatedHabit as any)

    const request = createPatchRequest({
      userId: 'user123',
      habit: 'water',
      value: false,
    })
    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.water).toBe(false)
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { water: false },
      })
    )
  })

  it('should return 400 on validation error - missing userId', async () => {
    const request = createPatchRequest({
      habit: 'water',
      value: true,
    })
    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 400 on validation error - invalid habit', async () => {
    const request = createPatchRequest({
      userId: 'user123',
      habit: 'invalid',
      value: true,
    })
    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 400 on validation error - missing value', async () => {
    const request = createPatchRequest({
      userId: 'user123',
      habit: 'water',
    })
    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 500 on database error', async () => {
    mockUpsert.mockRejectedValue(new Error('Database error'))

    const request = createPatchRequest({
      userId: 'user123',
      habit: 'water',
      value: true,
    })
    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
