import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/contact/route'
import { NextRequest } from 'next/server'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    contactMessage: {
      create: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a contact message with valid data', async () => {
    const mockMessage = {
      id: 'test-id',
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message for support.',
      createdAt: new Date(),
    }

    vi.mocked(prisma.contactMessage.create).mockResolvedValue(mockMessage)

    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message for support.',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.id).toBe('test-id')
    expect(data.message).toBe('Message sent successfully')
    expect(prisma.contactMessage.create).toHaveBeenCalledWith({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message for support.',
      },
    })
  })

  it('should return 400 for missing name', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        message: 'This is a test message for support.',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 400 for invalid email', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'not-an-email',
        message: 'This is a test message for support.',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 400 for message too short', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Short',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.contactMessage.create).mockRejectedValue(new Error('DB error'))

    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message for support.',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
  })
})
