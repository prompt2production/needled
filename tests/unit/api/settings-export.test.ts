import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/settings/export/route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/lib/api-auth', () => ({
  authenticateRequest: vi.fn(),
}))

vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return {
    ...actual,
    format: vi.fn().mockReturnValue('2026-01-24'),
  }
})

import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/api-auth'

const mockAuthenticateRequest = vi.mocked(authenticateRequest)
const mockUserFindUnique = vi.mocked(prisma.user.findUnique)

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
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockFullUserData = {
  id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  startWeight: 85,
  goalWeight: 75,
  weightUnit: 'kg',
  medication: 'OZEMPIC',
  injectionDay: 0,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-24'),
  weighIns: [
    { id: 'w1', weight: 82, date: new Date('2026-01-20'), createdAt: new Date() },
    { id: 'w2', weight: 84, date: new Date('2026-01-13'), createdAt: new Date() },
  ],
  injections: [
    { id: 'i1', date: new Date('2026-01-21'), site: 'ABDOMEN_LEFT', notes: null, createdAt: new Date() },
  ],
  dailyHabits: [
    {
      id: 'h1',
      date: new Date('2026-01-24'),
      water: true,
      nutrition: true,
      exercise: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  notificationPreference: {
    injectionReminder: true,
    weighInReminder: true,
    habitReminder: false,
    reminderTime: '09:00',
    habitReminderTime: '20:00',
    timezone: 'Europe/London',
  },
}

function createGetRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/settings/export', {
    method: 'GET',
  })
}

describe('GET /api/settings/export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 without auth token', async () => {
    mockAuthenticateRequest.mockResolvedValue(null)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should return 401 for invalid session', async () => {
    mockAuthenticateRequest.mockResolvedValue(null)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should export user data with correct structure', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('exportedAt')
    expect(data).toHaveProperty('exportVersion', '1.0')
    expect(data).toHaveProperty('user')
    expect(data).toHaveProperty('weighIns')
    expect(data).toHaveProperty('injections')
    expect(data).toHaveProperty('dailyHabits')
  })

  it('should include user profile in export', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(data.user.profile.id).toBe('user123')
    expect(data.user.profile.name).toBe('Test User')
    expect(data.user.profile.email).toBe('test@example.com')
    expect(data.user.profile.startWeight).toBe(85)
    expect(data.user.profile.goalWeight).toBe(75)
  })

  it('should include notification preferences in export', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(data.user.notificationPreferences).toBeDefined()
    expect(data.user.notificationPreferences.injectionReminder).toBe(true)
    expect(data.user.notificationPreferences.timezone).toBe('Europe/London')
  })

  it('should include weigh-ins in export', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(data.weighIns).toHaveLength(2)
    expect(data.weighIns[0].weight).toBe(82)
  })

  it('should include injections in export', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(data.injections).toHaveLength(1)
    expect(data.injections[0].site).toBe('ABDOMEN_LEFT')
  })

  it('should include daily habits in export', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(data.dailyHabits).toHaveLength(1)
    expect(data.dailyHabits[0].water).toBe(true)
    expect(data.dailyHabits[0].exercise).toBe(false)
  })

  it('should NOT include passwordHash in export', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(data.user.profile.passwordHash).toBeUndefined()
  })

  it('should set Content-Disposition header for download', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const request = createGetRequest()
    const response = await GET(request)

    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="needled-export-2026-01-24.json"'
    )
  })

  it('should set Content-Type header to application/json', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const request = createGetRequest()
    const response = await GET(request)

    expect(response.headers.get('Content-Type')).toBe('application/json')
  })

  it('should return 404 if user not found in database', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserFindUnique.mockResolvedValue(null)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('should return 500 on database error', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
      source: 'cookie',
    })
    mockUserFindUnique.mockRejectedValue(new Error('Database error'))

    const request = createGetRequest()
    const response = await GET(request)
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
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const request = new NextRequest('http://localhost:3000/api/settings/export', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer bearer-token' },
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="needled-export-2026-01-24.json"'
    )
  })
})
