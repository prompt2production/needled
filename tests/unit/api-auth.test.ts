import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock dependencies - must be before imports
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  validateSession: vi.fn(),
}))

import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { getAuthToken, authenticateRequest } from '@/lib/api-auth'

const mockCookies = vi.mocked(cookies)
const mockValidateSession = vi.mocked(validateSession)

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

describe('getAuthToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should extract Bearer token from Authorization header', async () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: { 'Authorization': 'Bearer my-bearer-token-123' },
    })

    const mockCookieStore = {
      get: vi.fn().mockReturnValue(null),
    }
    mockCookies.mockResolvedValue(mockCookieStore as never)

    const result = await getAuthToken(request)

    expect(result).toEqual({
      token: 'my-bearer-token-123',
      source: 'bearer',
    })
  })

  it('should fall back to cookie when no Bearer token', async () => {
    const request = new NextRequest('http://localhost:3000/api/test')

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: 'cookie-session-token' }),
    }
    mockCookies.mockResolvedValue(mockCookieStore as never)

    const result = await getAuthToken(request)

    expect(result).toEqual({
      token: 'cookie-session-token',
      source: 'cookie',
    })
    expect(mockCookieStore.get).toHaveBeenCalledWith('needled_session')
  })

  it('should prioritize Bearer token over cookie when both present', async () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: { 'Authorization': 'Bearer bearer-token-priority' },
    })

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: 'cookie-token-ignored' }),
    }
    mockCookies.mockResolvedValue(mockCookieStore as never)

    const result = await getAuthToken(request)

    expect(result).toEqual({
      token: 'bearer-token-priority',
      source: 'bearer',
    })
    // Should not check cookie since Bearer was found
    expect(mockCookieStore.get).not.toHaveBeenCalled()
  })

  it('should return null when neither Bearer nor cookie is present', async () => {
    const request = new NextRequest('http://localhost:3000/api/test')

    const mockCookieStore = {
      get: vi.fn().mockReturnValue(null),
    }
    mockCookies.mockResolvedValue(mockCookieStore as never)

    const result = await getAuthToken(request)

    expect(result).toBeNull()
  })

  it('should return null for invalid Authorization header (not Bearer)', async () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: { 'Authorization': 'Basic sometoken' },
    })

    const mockCookieStore = {
      get: vi.fn().mockReturnValue(null),
    }
    mockCookies.mockResolvedValue(mockCookieStore as never)

    const result = await getAuthToken(request)

    expect(result).toBeNull()
  })

  it('should return null for empty Bearer token', async () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: { 'Authorization': 'Bearer ' },
    })

    const mockCookieStore = {
      get: vi.fn().mockReturnValue(null),
    }
    mockCookies.mockResolvedValue(mockCookieStore as never)

    const result = await getAuthToken(request)

    expect(result).toBeNull()
  })

  it('should work without request parameter (cookie only)', async () => {
    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: 'cookie-only-token' }),
    }
    mockCookies.mockResolvedValue(mockCookieStore as never)

    const result = await getAuthToken()

    expect(result).toEqual({
      token: 'cookie-only-token',
      source: 'cookie',
    })
  })
})

describe('authenticateRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return null when no token is present', async () => {
    const request = new NextRequest('http://localhost:3000/api/test')

    const mockCookieStore = {
      get: vi.fn().mockReturnValue(null),
    }
    mockCookies.mockResolvedValue(mockCookieStore as never)

    const result = await authenticateRequest(request)

    expect(result).toBeNull()
    expect(mockValidateSession).not.toHaveBeenCalled()
  })

  it('should return null when session validation fails', async () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: { 'Authorization': 'Bearer invalid-token' },
    })

    const mockCookieStore = {
      get: vi.fn().mockReturnValue(null),
    }
    mockCookies.mockResolvedValue(mockCookieStore as never)
    mockValidateSession.mockResolvedValue(null)

    const result = await authenticateRequest(request)

    expect(result).toBeNull()
    expect(mockValidateSession).toHaveBeenCalledWith('invalid-token')
  })

  it('should return AuthResult with Bearer source for valid Bearer token', async () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: { 'Authorization': 'Bearer valid-bearer-token' },
    })

    const mockCookieStore = {
      get: vi.fn().mockReturnValue(null),
    }
    mockCookies.mockResolvedValue(mockCookieStore as never)
    mockValidateSession.mockResolvedValue(mockUser as never)

    const result = await authenticateRequest(request)

    expect(result).toEqual({
      user: mockUser,
      token: 'valid-bearer-token',
      source: 'bearer',
    })
    expect(mockValidateSession).toHaveBeenCalledWith('valid-bearer-token')
  })

  it('should return AuthResult with cookie source for valid cookie', async () => {
    const request = new NextRequest('http://localhost:3000/api/test')

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: 'valid-cookie-token' }),
    }
    mockCookies.mockResolvedValue(mockCookieStore as never)
    mockValidateSession.mockResolvedValue(mockUser as never)

    const result = await authenticateRequest(request)

    expect(result).toEqual({
      user: mockUser,
      token: 'valid-cookie-token',
      source: 'cookie',
    })
    expect(mockValidateSession).toHaveBeenCalledWith('valid-cookie-token')
  })

  it('should work without request parameter (cookie only)', async () => {
    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: 'cookie-token' }),
    }
    mockCookies.mockResolvedValue(mockCookieStore as never)
    mockValidateSession.mockResolvedValue(mockUser as never)

    const result = await authenticateRequest()

    expect(result).toEqual({
      user: mockUser,
      token: 'cookie-token',
      source: 'cookie',
    })
  })

  it('should prefer Bearer over cookie for authentication', async () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: { 'Authorization': 'Bearer bearer-preferred' },
    })

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: 'cookie-ignored' }),
    }
    mockCookies.mockResolvedValue(mockCookieStore as never)
    mockValidateSession.mockResolvedValue(mockUser as never)

    const result = await authenticateRequest(request)

    expect(result?.source).toBe('bearer')
    expect(result?.token).toBe('bearer-preferred')
    expect(mockValidateSession).toHaveBeenCalledWith('bearer-preferred')
    expect(mockValidateSession).not.toHaveBeenCalledWith('cookie-ignored')
  })
})
