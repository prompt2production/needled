import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/settings/export/route'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/lib/cookies', () => ({
  getSessionToken: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  validateSession: vi.fn(),
}))

vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return {
    ...actual,
    format: vi.fn().mockReturnValue('2026-01-24'),
  }
})

import { prisma } from '@/lib/prisma'
import { getSessionToken } from '@/lib/cookies'
import { validateSession } from '@/lib/auth'

const mockGetSessionToken = vi.mocked(getSessionToken)
const mockValidateSession = vi.mocked(validateSession)
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

describe('GET /api/settings/export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 without auth token', async () => {
    mockGetSessionToken.mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should return 401 for invalid session', async () => {
    mockGetSessionToken.mockResolvedValue('invalid-token')
    mockValidateSession.mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should export user data with correct structure', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const response = await GET()
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
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const response = await GET()
    const data = await response.json()

    expect(data.user.profile.id).toBe('user123')
    expect(data.user.profile.name).toBe('Test User')
    expect(data.user.profile.email).toBe('test@example.com')
    expect(data.user.profile.startWeight).toBe(85)
    expect(data.user.profile.goalWeight).toBe(75)
  })

  it('should include notification preferences in export', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const response = await GET()
    const data = await response.json()

    expect(data.user.notificationPreferences).toBeDefined()
    expect(data.user.notificationPreferences.injectionReminder).toBe(true)
    expect(data.user.notificationPreferences.timezone).toBe('Europe/London')
  })

  it('should include weigh-ins in export', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const response = await GET()
    const data = await response.json()

    expect(data.weighIns).toHaveLength(2)
    expect(data.weighIns[0].weight).toBe(82)
  })

  it('should include injections in export', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const response = await GET()
    const data = await response.json()

    expect(data.injections).toHaveLength(1)
    expect(data.injections[0].site).toBe('ABDOMEN_LEFT')
  })

  it('should include daily habits in export', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const response = await GET()
    const data = await response.json()

    expect(data.dailyHabits).toHaveLength(1)
    expect(data.dailyHabits[0].water).toBe(true)
    expect(data.dailyHabits[0].exercise).toBe(false)
  })

  it('should NOT include passwordHash in export', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const response = await GET()
    const data = await response.json()

    expect(data.user.profile.passwordHash).toBeUndefined()
  })

  it('should set Content-Disposition header for download', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const response = await GET()

    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="needled-export-2026-01-24.json"'
    )
  })

  it('should set Content-Type header to application/json', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockUserFindUnique.mockResolvedValue(mockFullUserData as never)

    const response = await GET()

    expect(response.headers.get('Content-Type')).toBe('application/json')
  })

  it('should return 404 if user not found in database', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockUserFindUnique.mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('should return 500 on database error', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockUserFindUnique.mockRejectedValue(new Error('Database error'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
