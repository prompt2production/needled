import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PUT } from '@/app/api/notifications/preferences/route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    notificationPreference: {
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
  },
}))

vi.mock('@/lib/cookies', () => ({
  getSessionToken: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  validateSession: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { getSessionToken } from '@/lib/cookies'
import { validateSession } from '@/lib/auth'

const mockGetSessionToken = vi.mocked(getSessionToken)
const mockValidateSession = vi.mocked(validateSession)
const mockFindUnique = vi.mocked(prisma.notificationPreference.findUnique)
const mockCreate = vi.mocked(prisma.notificationPreference.create)
const mockUpsert = vi.mocked(prisma.notificationPreference.upsert)

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

const mockPreferences = {
  id: 'pref123',
  userId: 'user123',
  injectionReminder: true,
  weighInReminder: true,
  habitReminder: false,
  reminderTime: '09:00',
  habitReminderTime: '20:00',
  timezone: 'Europe/London',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('GET /api/notifications/preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 without auth', async () => {
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

  it('should return preferences for authenticated user', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockFindUnique.mockResolvedValue(mockPreferences as never)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.userId).toBe('user123')
    expect(data.injectionReminder).toBe(true)
  })

  it('should create default preferences if none exist', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)
    mockFindUnique.mockResolvedValue(null)
    mockCreate.mockResolvedValue(mockPreferences as never)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user123',
        injectionReminder: true,
        weighInReminder: true,
        habitReminder: false,
        reminderTime: '09:00',
        habitReminderTime: '20:00',
        timezone: 'Europe/London',
      }),
    })
    expect(data.userId).toBe('user123')
  })
})

describe('PUT /api/notifications/preferences', () => {
  const validInput = {
    injectionReminder: false,
    weighInReminder: true,
    habitReminder: true,
    reminderTime: '08:00',
    habitReminderTime: '21:00',
    timezone: 'America/New_York',
  }

  function createPutRequest(body: object): NextRequest {
    return new NextRequest('http://localhost:3000/api/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 without auth', async () => {
    mockGetSessionToken.mockResolvedValue(null)

    const request = createPutRequest(validInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should return 400 for invalid input', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)

    const invalidInput = {
      injectionReminder: 'not a boolean', // should be boolean
      weighInReminder: true,
      habitReminder: false,
      reminderTime: 'invalid', // should be HH:mm
      habitReminderTime: '20:00',
      timezone: '', // should be non-empty
    }

    const request = createPutRequest(invalidInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(Array.isArray(data.error)).toBe(true)
  })

  it('should update preferences successfully', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)

    const updatedPreferences = {
      ...mockPreferences,
      ...validInput,
    }
    mockUpsert.mockResolvedValue(updatedPreferences as never)

    const request = createPutRequest(validInput)
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { userId: 'user123' },
      create: {
        userId: 'user123',
        ...validInput,
      },
      update: validInput,
    })
    expect(data.injectionReminder).toBe(false)
    expect(data.habitReminder).toBe(true)
    expect(data.timezone).toBe('America/New_York')
  })

  it('should create preferences if none exist (upsert)', async () => {
    mockGetSessionToken.mockResolvedValue('valid-token')
    mockValidateSession.mockResolvedValue(mockUser as never)

    const newPreferences = {
      id: 'new-pref',
      userId: 'user123',
      ...validInput,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockUpsert.mockResolvedValue(newPreferences as never)

    const request = createPutRequest(validInput)
    const response = await PUT(request)

    expect(response.status).toBe(200)
    expect(mockUpsert).toHaveBeenCalled()
  })
})
