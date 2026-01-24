import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PATCH } from '@/app/api/injections/[id]/route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    injection: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockFindUnique = vi.mocked(prisma.injection.findUnique)
const mockUpdate = vi.mocked(prisma.injection.update)

function createPatchRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/injections/injection123', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const createParams = (id: string) => ({ params: Promise.resolve({ id }) })

describe('PATCH /api/injections/[id]', () => {
  const mockInjection = {
    id: 'injection123',
    userId: 'user123',
    site: 'ABDOMEN_LEFT',
    notes: 'Original notes',
    date: new Date('2026-01-20'),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-24T12:00:00Z'))
    mockFindUnique.mockResolvedValue(mockInjection)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return 200 with updated injection on success', async () => {
    const updatedInjection = { ...mockInjection, site: 'ABDOMEN_RIGHT' }
    mockUpdate.mockResolvedValue(updatedInjection)

    const request = createPatchRequest({ userId: 'user123', site: 'ABDOMEN_RIGHT' })
    const response = await PATCH(request, createParams('injection123'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.site).toBe('ABDOMEN_RIGHT')
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'injection123' },
      data: { site: 'ABDOMEN_RIGHT' },
    })
  })

  it('should update date when provided', async () => {
    const updatedInjection = { ...mockInjection, date: new Date('2026-01-20T12:00:00Z') }
    mockUpdate.mockResolvedValue(updatedInjection)

    const request = createPatchRequest({ userId: 'user123', date: '2026-01-20' })
    const response = await PATCH(request, createParams('injection123'))

    expect(response.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'injection123' },
      data: { date: new Date('2026-01-20T12:00:00Z') },
    })
  })

  it('should update notes when provided', async () => {
    const updatedInjection = { ...mockInjection, notes: 'Updated notes' }
    mockUpdate.mockResolvedValue(updatedInjection)

    const request = createPatchRequest({ userId: 'user123', notes: 'Updated notes' })
    const response = await PATCH(request, createParams('injection123'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.notes).toBe('Updated notes')
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'injection123' },
      data: { notes: 'Updated notes' },
    })
  })

  it('should return 404 if injection not found', async () => {
    mockFindUnique.mockResolvedValue(null)

    const request = createPatchRequest({ userId: 'user123', site: 'ABDOMEN_RIGHT' })
    const response = await PATCH(request, createParams('nonexistent'))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Injection not found')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should return 404 if injection belongs to different user', async () => {
    const request = createPatchRequest({ userId: 'different-user', site: 'ABDOMEN_RIGHT' })
    const response = await PATCH(request, createParams('injection123'))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Injection not found')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should return 400 for invalid site', async () => {
    const request = createPatchRequest({ userId: 'user123', site: 'INVALID_SITE' })
    const response = await PATCH(request, createParams('injection123'))

    expect(response.status).toBe(400)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should return 400 for invalid date (future)', async () => {
    const request = createPatchRequest({ userId: 'user123', date: '2026-01-25' })
    const response = await PATCH(request, createParams('injection123'))

    expect(response.status).toBe(400)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should return 400 for notes exceeding max length', async () => {
    const longNotes = 'a'.repeat(501)
    const request = createPatchRequest({ userId: 'user123', notes: longNotes })
    const response = await PATCH(request, createParams('injection123'))

    expect(response.status).toBe(400)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should return 500 on database error', async () => {
    mockUpdate.mockRejectedValue(new Error('Database error'))

    const request = createPatchRequest({ userId: 'user123', site: 'ABDOMEN_RIGHT' })
    const response = await PATCH(request, createParams('injection123'))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
