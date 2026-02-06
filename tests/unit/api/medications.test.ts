import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/medications/route'

// Mock the api-auth module
vi.mock('@/lib/api-auth', () => ({
  authenticateRequest: vi.fn(),
}))

// Mock the prisma module
vi.mock('@/lib/prisma', () => ({
  prisma: {
    medicationConfig: {
      findMany: vi.fn(),
    },
    microdoseAmount: {
      findMany: vi.fn(),
    },
    systemConfig: {
      findUnique: vi.fn(),
    },
  },
}))

import { authenticateRequest } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const mockAuthenticateRequest = vi.mocked(authenticateRequest)
const mockPrisma = vi.mocked(prisma)

// Sample medication data matching what would be in the database
const mockMedications = [
  {
    id: 'med-1',
    code: 'OZEMPIC',
    name: 'Ozempic',
    manufacturer: 'Novo Nordisk',
    supportsMicrodosing: true,
    sortOrder: 1,
    isActive: true,
    dosages: [
      { id: 'd1', dosageMg: 0.25, sortOrder: 1 },
      { id: 'd2', dosageMg: 0.5, sortOrder: 2 },
      { id: 'd3', dosageMg: 1, sortOrder: 3 },
      { id: 'd4', dosageMg: 2, sortOrder: 4 },
    ],
    penStrengths: [
      { id: 'p1', strengthMg: 2, sortOrder: 1 },
      { id: 'p2', strengthMg: 4, sortOrder: 2 },
      { id: 'p3', strengthMg: 8, sortOrder: 3 },
    ],
  },
  {
    id: 'med-2',
    code: 'OTHER',
    name: 'Other',
    manufacturer: null,
    supportsMicrodosing: false,
    sortOrder: 99,
    isActive: true,
    dosages: [],
    penStrengths: [],
  },
]

const mockMicrodoseAmounts = [
  { id: 'ma1', amountMg: 0.25, sortOrder: 1, isActive: true },
  { id: 'ma2', amountMg: 0.5, sortOrder: 2, isActive: true },
  { id: 'ma3', amountMg: 1, sortOrder: 3, isActive: true },
]

describe('GET /api/medications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockAuthenticateRequest.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/medications')
    const response = await GET(request)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('should return medication configuration from database when authenticated', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
      session: { id: 'session-id', token: 'test-token' },
    })

    mockPrisma.medicationConfig.findMany.mockResolvedValue(mockMedications as never)
    mockPrisma.microdoseAmount.findMany.mockResolvedValue(mockMicrodoseAmounts as never)
    mockPrisma.systemConfig.findUnique.mockResolvedValue({
      id: 'sc1',
      key: 'defaultDosesPerPen',
      value: '4',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new NextRequest('http://localhost:3000/api/medications')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()

    // Check structure
    expect(data).toHaveProperty('medications')
    expect(data).toHaveProperty('microdoseAmounts')
    expect(data).toHaveProperty('defaultDosesPerPen')

    // Check medications array
    expect(Array.isArray(data.medications)).toBe(true)
    expect(data.medications.length).toBe(2)

    // Check medication codes
    const codes = data.medications.map((m: { code: string }) => m.code)
    expect(codes).toContain('OZEMPIC')
    expect(codes).toContain('OTHER')
  })

  it('should return correct Ozempic configuration', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
      session: { id: 'session-id', token: 'test-token' },
    })

    mockPrisma.medicationConfig.findMany.mockResolvedValue(mockMedications as never)
    mockPrisma.microdoseAmount.findMany.mockResolvedValue(mockMicrodoseAmounts as never)
    mockPrisma.systemConfig.findUnique.mockResolvedValue({
      id: 'sc1',
      key: 'defaultDosesPerPen',
      value: '4',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new NextRequest('http://localhost:3000/api/medications')
    const response = await GET(request)

    const data = await response.json()
    const ozempic = data.medications.find((m: { code: string }) => m.code === 'OZEMPIC')

    expect(ozempic).toEqual({
      code: 'OZEMPIC',
      name: 'Ozempic',
      manufacturer: 'Novo Nordisk',
      dosages: [0.25, 0.5, 1, 2],
      penStrengths: [2, 4, 8],
      supportsMicrodosing: true,
    })
  })

  it('should return correct OTHER medication configuration', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
      session: { id: 'session-id', token: 'test-token' },
    })

    mockPrisma.medicationConfig.findMany.mockResolvedValue(mockMedications as never)
    mockPrisma.microdoseAmount.findMany.mockResolvedValue(mockMicrodoseAmounts as never)
    mockPrisma.systemConfig.findUnique.mockResolvedValue({
      id: 'sc1',
      key: 'defaultDosesPerPen',
      value: '4',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new NextRequest('http://localhost:3000/api/medications')
    const response = await GET(request)

    const data = await response.json()
    const other = data.medications.find((m: { code: string }) => m.code === 'OTHER')

    expect(other).toEqual({
      code: 'OTHER',
      name: 'Other',
      manufacturer: null,
      dosages: [],
      penStrengths: [],
      supportsMicrodosing: false,
    })
  })

  it('should return microdose amounts from database', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
      session: { id: 'session-id', token: 'test-token' },
    })

    mockPrisma.medicationConfig.findMany.mockResolvedValue(mockMedications as never)
    mockPrisma.microdoseAmount.findMany.mockResolvedValue(mockMicrodoseAmounts as never)
    mockPrisma.systemConfig.findUnique.mockResolvedValue({
      id: 'sc1',
      key: 'defaultDosesPerPen',
      value: '4',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new NextRequest('http://localhost:3000/api/medications')
    const response = await GET(request)

    const data = await response.json()
    expect(data.microdoseAmounts).toEqual([0.25, 0.5, 1])
  })

  it('should return default doses per pen from system config', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
      session: { id: 'session-id', token: 'test-token' },
    })

    mockPrisma.medicationConfig.findMany.mockResolvedValue(mockMedications as never)
    mockPrisma.microdoseAmount.findMany.mockResolvedValue(mockMicrodoseAmounts as never)
    mockPrisma.systemConfig.findUnique.mockResolvedValue({
      id: 'sc1',
      key: 'defaultDosesPerPen',
      value: '4',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new NextRequest('http://localhost:3000/api/medications')
    const response = await GET(request)

    const data = await response.json()
    expect(data.defaultDosesPerPen).toBe(4)
  })

  it('should fallback to 4 if defaultDosesPerPen not configured', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
      session: { id: 'session-id', token: 'test-token' },
    })

    mockPrisma.medicationConfig.findMany.mockResolvedValue(mockMedications as never)
    mockPrisma.microdoseAmount.findMany.mockResolvedValue(mockMicrodoseAmounts as never)
    mockPrisma.systemConfig.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/medications')
    const response = await GET(request)

    const data = await response.json()
    expect(data.defaultDosesPerPen).toBe(4)
  })

  it('should include Cache-Control header', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
      session: { id: 'session-id', token: 'test-token' },
    })

    mockPrisma.medicationConfig.findMany.mockResolvedValue(mockMedications as never)
    mockPrisma.microdoseAmount.findMany.mockResolvedValue(mockMicrodoseAmounts as never)
    mockPrisma.systemConfig.findUnique.mockResolvedValue({
      id: 'sc1',
      key: 'defaultDosesPerPen',
      value: '4',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new NextRequest('http://localhost:3000/api/medications')
    const response = await GET(request)

    expect(response.headers.get('Cache-Control')).toBe('max-age=86400')
  })

  it('should return 500 if database query fails', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
      session: { id: 'session-id', token: 'test-token' },
    })

    mockPrisma.medicationConfig.findMany.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost:3000/api/medications')
    const response = await GET(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Failed to fetch medication configuration')
  })
})
