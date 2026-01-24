import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PATCH, DELETE } from '@/app/api/weigh-ins/[id]/route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    weighIn: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockFindUnique = vi.mocked(prisma.weighIn.findUnique)
const mockUpdate = vi.mocked(prisma.weighIn.update)
const mockDelete = vi.mocked(prisma.weighIn.delete)

function createPatchRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/weigh-ins/weighin123', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function createDeleteRequest(userId: string): NextRequest {
  return new NextRequest(
    `http://localhost:3000/api/weigh-ins/weighin123?userId=${userId}`,
    { method: 'DELETE' }
  )
}

const createParams = (id: string) => ({ params: Promise.resolve({ id }) })

describe('PATCH /api/weigh-ins/[id]', () => {
  const mockWeighIn = {
    id: 'weighin123',
    userId: 'user123',
    weight: 85,
    date: new Date('2026-01-20'),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-24T12:00:00Z'))
    mockFindUnique.mockResolvedValue(mockWeighIn)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return 200 with updated weigh-in on success', async () => {
    const updatedWeighIn = { ...mockWeighIn, weight: 84 }
    mockUpdate.mockResolvedValue(updatedWeighIn)

    const request = createPatchRequest({ userId: 'user123', weight: 84 })
    const response = await PATCH(request, createParams('weighin123'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.weight).toBe(84)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'weighin123' },
      data: { weight: 84 },
    })
  })

  it('should update date when provided', async () => {
    const updatedWeighIn = { ...mockWeighIn, date: new Date('2026-01-20T12:00:00Z') }
    mockUpdate.mockResolvedValue(updatedWeighIn)

    const request = createPatchRequest({ userId: 'user123', date: '2026-01-20' })
    const response = await PATCH(request, createParams('weighin123'))

    expect(response.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'weighin123' },
      data: { date: new Date('2026-01-20T12:00:00Z') },
    })
  })

  it('should return 404 if weigh-in not found', async () => {
    mockFindUnique.mockResolvedValue(null)

    const request = createPatchRequest({ userId: 'user123', weight: 84 })
    const response = await PATCH(request, createParams('nonexistent'))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Weigh-in not found')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should return 404 if weigh-in belongs to different user', async () => {
    const request = createPatchRequest({ userId: 'different-user', weight: 84 })
    const response = await PATCH(request, createParams('weighin123'))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Weigh-in not found')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should return 400 for invalid weight', async () => {
    const request = createPatchRequest({ userId: 'user123', weight: -10 })
    const response = await PATCH(request, createParams('weighin123'))

    expect(response.status).toBe(400)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should return 400 for invalid date (future)', async () => {
    const request = createPatchRequest({ userId: 'user123', date: '2026-01-25' })
    const response = await PATCH(request, createParams('weighin123'))

    expect(response.status).toBe(400)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should return 500 on database error', async () => {
    mockUpdate.mockRejectedValue(new Error('Database error'))

    const request = createPatchRequest({ userId: 'user123', weight: 84 })
    const response = await PATCH(request, createParams('weighin123'))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})

describe('DELETE /api/weigh-ins/[id]', () => {
  const mockWeighIn = {
    id: 'weighin123',
    userId: 'user123',
    weight: 85,
    date: new Date('2026-01-20'),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFindUnique.mockResolvedValue(mockWeighIn)
  })

  it('should return 204 on successful deletion', async () => {
    mockDelete.mockResolvedValue(mockWeighIn)

    const request = createDeleteRequest('user123')
    const response = await DELETE(request, createParams('weighin123'))

    expect(response.status).toBe(204)
    expect(mockDelete).toHaveBeenCalledWith({
      where: { id: 'weighin123' },
    })
  })

  it('should return 400 if userId not provided', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/weigh-ins/weighin123',
      { method: 'DELETE' }
    )
    const response = await DELETE(request, createParams('weighin123'))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('userId is required')
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('should return 404 if weigh-in not found', async () => {
    mockFindUnique.mockResolvedValue(null)

    const request = createDeleteRequest('user123')
    const response = await DELETE(request, createParams('nonexistent'))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Weigh-in not found')
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('should return 404 if weigh-in belongs to different user', async () => {
    const request = createDeleteRequest('different-user')
    const response = await DELETE(request, createParams('weighin123'))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Weigh-in not found')
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('should return 500 on database error', async () => {
    mockDelete.mockRejectedValue(new Error('Database error'))

    const request = createDeleteRequest('user123')
    const response = await DELETE(request, createParams('weighin123'))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
