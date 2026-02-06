import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET } from '@/app/api/injections/status/route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    injection: {
      findFirst: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/lib/api-auth', () => ({
  authenticateRequest: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/api-auth'

const mockAuthenticateRequest = vi.mocked(authenticateRequest)
const mockInjectionFindFirst = vi.mocked(prisma.injection.findFirst)
const mockUserFindUnique = vi.mocked(prisma.user.findUnique)

// Injection day constants: 0 = Monday, ..., 2 = Wednesday, ..., 6 = Sunday
const WEDNESDAY = 2

function createGetRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/injections/status', { method: 'GET' })
}

describe('GET /api/injections/status', () => {
  const mockUser = {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    startWeight: 100,
    goalWeight: 80,
    weightUnit: 'kg',
    medication: 'OZEMPIC',
    injectionDay: WEDNESDAY,
    currentDosage: null,
    height: null,
    expoPushToken: null,
    pushTokenPlatform: null,
    pushTokenUpdatedAt: null,
    dosingMode: 'STANDARD' as const,
    penStrengthMg: null,
    doseAmountMg: null,
    dosesPerPen: 4,
    tracksGoldenDose: false,
    currentDoseInPen: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockInjection = {
    id: 'injection123',
    userId: 'user123',
    site: 'ABDOMEN_LEFT',
    doseNumber: 1,
    dosageMg: null,
    isGoldenDose: false,
    notes: null,
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    // Default: Wednesday, January 22, 2025 (user's injection day)
    vi.setSystemTime(new Date(2025, 0, 22, 12, 0, 0))
    mockAuthenticateRequest.mockResolvedValue({ user: mockUser, session: { id: 'session123', userId: 'user123', expiresAt: new Date() } })
    mockUserFindUnique.mockResolvedValue(mockUser as any)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return 401 if not authenticated', async () => {
    mockAuthenticateRequest.mockResolvedValue(null)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should return 404 if user not found', async () => {
    mockUserFindUnique.mockResolvedValue(null)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  describe('status: due', () => {
    it('should return status "due" when today is injection day and no injection logged', async () => {
      // Today is Wednesday (injection day), no injection this week
      mockInjectionFindFirst.mockResolvedValue(null)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('due')
      expect(data.daysUntil).toBe(0)
      expect(data.daysOverdue).toBe(0)
    })
  })

  describe('status: done', () => {
    it('should return status "done" when injection logged this week', async () => {
      // Return injection for this week
      mockInjectionFindFirst.mockResolvedValue(mockInjection as any)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('done')
      expect(data.daysUntil).toBe(0)
      expect(data.daysOverdue).toBe(0)
      expect(data.lastInjection).toBeDefined()
      expect(data.lastInjection.site).toBe('ABDOMEN_LEFT')
    })
  })

  describe('status: overdue', () => {
    it('should return status "overdue" when past injection day with existing injection history', async () => {
      // Thursday, January 23, 2025 - 1 day after injection day
      vi.setSystemTime(new Date(2025, 0, 23, 12, 0, 0))
      // First call: no injection this week; Second call: has last injection (existing user)
      const oldInjection = { ...mockInjection, date: new Date(2025, 0, 15) }
      mockInjectionFindFirst
        .mockResolvedValueOnce(null) // No injection this week
        .mockResolvedValueOnce(oldInjection as any) // Has injection history

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('overdue')
      expect(data.daysOverdue).toBe(1)
      expect(data.daysUntil).toBe(-1) // Negative days = days past due
    })

    it('should return correct daysOverdue count for existing users', async () => {
      // Saturday, January 25, 2025 - 3 days after injection day
      vi.setSystemTime(new Date(2025, 0, 25, 12, 0, 0))
      const oldInjection = { ...mockInjection, date: new Date(2025, 0, 15) }
      mockInjectionFindFirst
        .mockResolvedValueOnce(null) // No injection this week
        .mockResolvedValueOnce(oldInjection as any) // Has injection history

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(data.status).toBe('overdue')
      expect(data.daysOverdue).toBe(3)
      expect(data.daysUntil).toBe(-3) // Negative days = days past due
    })

    it('should return "upcoming" for new users even past injection day', async () => {
      // Thursday, January 23, 2025 - 1 day after injection day
      vi.setSystemTime(new Date(2025, 0, 23, 12, 0, 0))
      // New user - no injection history at all
      mockInjectionFindFirst.mockResolvedValue(null)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      // New users can't be overdue - they're always "upcoming" until their injection day
      expect(response.status).toBe(200)
      expect(data.status).toBe('upcoming')
      expect(data.daysUntil).toBe(6) // Days until next Wednesday
      expect(data.daysOverdue).toBe(0)
    })
  })

  describe('status: upcoming', () => {
    it('should return status "upcoming" when before injection day', async () => {
      // Monday, January 20, 2025 - 2 days before injection day (Wednesday)
      vi.setSystemTime(new Date(2025, 0, 20, 12, 0, 0))
      mockInjectionFindFirst.mockResolvedValue(null)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('upcoming')
      expect(data.daysUntil).toBe(2)
      expect(data.daysOverdue).toBe(0)
    })

    it('should return correct daysUntil count', async () => {
      // Tuesday, January 21, 2025 - 1 day before injection day
      vi.setSystemTime(new Date(2025, 0, 21, 12, 0, 0))
      mockInjectionFindFirst.mockResolvedValue(null)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(data.status).toBe('upcoming')
      expect(data.daysUntil).toBe(1)
    })
  })

  describe('suggestedSite', () => {
    it('should return ABDOMEN_LEFT when no previous injections', async () => {
      mockInjectionFindFirst.mockResolvedValue(null)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(data.suggestedSite).toBe('ABDOMEN_LEFT')
    })

    it('should return next site in rotation based on last injection', async () => {
      // First call for this week's injection (none), second call for last injection (ABDOMEN_LEFT)
      mockInjectionFindFirst
        .mockResolvedValueOnce(null) // No injection this week
        .mockResolvedValueOnce(mockInjection as any) // Last injection was ABDOMEN_LEFT

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(data.suggestedSite).toBe('ABDOMEN_RIGHT')
    })
  })

  describe('lastInjection', () => {
    it('should return null when no previous injections', async () => {
      mockInjectionFindFirst.mockResolvedValue(null)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(data.lastInjection).toBeNull()
    })

    it('should return last injection details when exists', async () => {
      const injectionWithNotes = {
        ...mockInjection,
        notes: 'Felt good',
      }
      mockInjectionFindFirst.mockResolvedValue(injectionWithNotes as any)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(data.lastInjection).toBeDefined()
      expect(data.lastInjection.id).toBe('injection123')
      expect(data.lastInjection.site).toBe('ABDOMEN_LEFT')
      expect(data.lastInjection.notes).toBe('Felt good')
    })
  })

  it('should return 500 on database error', async () => {
    mockUserFindUnique.mockRejectedValue(new Error('Database error'))

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  describe('dose tracking fields', () => {
    it('should return currentDose as null when no previous injection', async () => {
      mockInjectionFindFirst.mockResolvedValue(null)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.currentDose).toBeNull()
    })

    it('should return currentDose from most recent injection', async () => {
      const injectionWithDose3 = { ...mockInjection, doseNumber: 3 }
      mockInjectionFindFirst.mockResolvedValue(injectionWithDose3 as any)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.currentDose).toBe(3)
    })

    it('should return nextDose from currentDoseInPen when no previous injection', async () => {
      mockInjectionFindFirst.mockResolvedValue(null)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      // Uses user.currentDoseInPen (1) from mockUser
      expect(data.nextDose).toBe(1)
    })

    it('should use registration currentDoseInPen for new users', async () => {
      // User registered with currentDoseInPen: 3 (starting mid-pen)
      const userWithMidPenDose = { ...mockUser, currentDoseInPen: 3 }
      mockAuthenticateRequest.mockResolvedValue({ user: userWithMidPenDose, session: { id: 'session123', userId: 'user123', expiresAt: new Date() } })
      mockUserFindUnique.mockResolvedValue(userWithMidPenDose as any)
      mockInjectionFindFirst.mockResolvedValue(null)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(data.currentDose).toBeNull()
      expect(data.nextDose).toBe(3) // Uses currentDoseInPen from registration
      expect(data.dosesRemaining).toBe(2) // 4 - 3 + 1 = 2 (doses 3 and 4)
    })

    it('should return nextDose calculated from currentDose', async () => {
      const injectionWithDose2 = { ...mockInjection, doseNumber: 2 }
      mockInjectionFindFirst.mockResolvedValue(injectionWithDose2 as any)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(data.nextDose).toBe(3)
    })

    it('should return nextDose as 1 when currentDose is 4 (new pen)', async () => {
      const injectionWithDose4 = { ...mockInjection, doseNumber: 4 }
      mockInjectionFindFirst.mockResolvedValue(injectionWithDose4 as any)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(data.nextDose).toBe(1)
    })

    it('should return dosesRemaining as 4 when no previous injection (starting at dose 1)', async () => {
      mockInjectionFindFirst.mockResolvedValue(null)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      // nextDose = 1 (from currentDoseInPen), dosesRemaining = 4 - 1 + 1 = 4
      expect(data.dosesRemaining).toBe(4)
    })

    it('should return dosesRemaining as 3 when nextDose is 2', async () => {
      mockInjectionFindFirst.mockResolvedValue(mockInjection as any) // doseNumber: 1

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      // After dose 1, nextDose = 2, dosesRemaining = 4 - 2 + 1 = 3
      expect(data.dosesRemaining).toBe(3)
    })

    it('should return dosesRemaining as 4 when currentDose is 4 (new pen)', async () => {
      const injectionWithDose4 = { ...mockInjection, doseNumber: 4 }
      mockInjectionFindFirst.mockResolvedValue(injectionWithDose4 as any)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      // After dose 4, nextDose = 1 (new pen), dosesRemaining = 4 - 1 + 1 = 4
      expect(data.dosesRemaining).toBe(4)
    })

    it('should include doseNumber in lastInjection', async () => {
      const injectionWithDose2 = { ...mockInjection, doseNumber: 2, notes: 'Test notes' }
      mockInjectionFindFirst.mockResolvedValue(injectionWithDose2 as any)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(data.lastInjection.doseNumber).toBe(2)
    })
  })

  describe('golden dose tracking', () => {
    it('should return tracksGoldenDose from user settings', async () => {
      const userWithGoldenDose = { ...mockUser, tracksGoldenDose: true }
      mockAuthenticateRequest.mockResolvedValue({ user: userWithGoldenDose, session: { id: 'session123', userId: 'user123', expiresAt: new Date() } })
      mockUserFindUnique.mockResolvedValue(userWithGoldenDose as any)
      mockInjectionFindFirst.mockResolvedValue(null)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(data.tracksGoldenDose).toBe(true)
    })

    it('should indicate golden dose available when at last standard dose', async () => {
      const userWithGoldenDose = { ...mockUser, tracksGoldenDose: true }
      const injectionAtDose4 = { ...mockInjection, doseNumber: 4 }
      mockAuthenticateRequest.mockResolvedValue({ user: userWithGoldenDose, session: { id: 'session123', userId: 'user123', expiresAt: new Date() } })
      mockUserFindUnique.mockResolvedValue(userWithGoldenDose as any)
      mockInjectionFindFirst.mockResolvedValue(injectionAtDose4 as any)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(data.isGoldenDoseAvailable).toBe(true)
      expect(data.nextDose).toBe(5) // Golden dose position
    })

    it('should indicate user on golden dose when new user starts at golden dose position', async () => {
      const userOnGoldenDose = { ...mockUser, tracksGoldenDose: true, currentDoseInPen: 5, dosesPerPen: 4 }
      mockAuthenticateRequest.mockResolvedValue({ user: userOnGoldenDose, session: { id: 'session123', userId: 'user123', expiresAt: new Date() } })
      mockUserFindUnique.mockResolvedValue(userOnGoldenDose as any)
      mockInjectionFindFirst.mockResolvedValue(null)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(data.currentDose).toBeNull()
      expect(data.nextDose).toBe(5)
      expect(data.dosesRemaining).toBe(0) // No standard doses left
      expect(data.isGoldenDoseAvailable).toBe(true)
      expect(data.isOnGoldenDose).toBe(true)
    })
  })
})
