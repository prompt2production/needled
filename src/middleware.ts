import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const COOKIE_NAME = 'needled_session'

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/weigh-in',
  '/injection',
  '/habits',
  '/calendar',
  '/settings',
  '/home', // Legacy route, redirect to dashboard if authenticated
]

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/login', '/onboarding']

// Routes that are always public (no session check needed)
const PUBLIC_ROUTES = ['/', '/design']

// API routes that bypass middleware (auth routes handle their own auth)
const PUBLIC_API_ROUTES = ['/api/auth/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public API routes
  if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Get session token from cookie
  const sessionToken = request.cookies.get(COOKIE_NAME)?.value

  // Validate session if token exists
  let isAuthenticated = false
  if (sessionToken) {
    try {
      const session = await prisma.session.findUnique({
        where: { token: sessionToken },
        select: { expiresAt: true },
      })
      isAuthenticated = session !== null && session.expiresAt > new Date()
    } catch {
      // Database error - treat as not authenticated
      isAuthenticated = false
    }
  }

  // Check if current route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  // Check if current route is an auth route (login/onboarding)
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  // Check if current route is the home page
  const isHomePage = pathname === '/'

  // Protected routes: redirect to login if not authenticated
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Auth routes: redirect to dashboard if already authenticated
  if (isAuthRoute && isAuthenticated) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // Home page: redirect to dashboard if authenticated
  if (isHomePage && isAuthenticated) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - handled separately above
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
