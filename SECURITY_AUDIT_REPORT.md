# Security Audit Report

**Application:** Needled - GLP-1 Weight Loss Journey Companion
**Audit Date:** 2026-01-31
**Audit Type:** Full Comprehensive Audit
**Auditor:** saas-security-auditor

---

## Executive Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 4 |
| HIGH | 5 |
| MEDIUM | 6 |
| LOW | 4 |
| Passed Checks | 18 |

**Detected Stack:**
- Auth Pattern: Custom Session-Based (bcrypt + session tokens)
- Multi-Tenancy: Single-tenant design (no multi-tenancy, but user isolation required)
- Database: PostgreSQL with Prisma ORM
- Deployment: Docker Compose with nginx-proxy on Linux VPS

**Critical Risk Summary:**
This application has **severe authentication bypass vulnerabilities**. Multiple API routes accept `userId` from request parameters without authentication, allowing any user to read/modify any other user's data. This is the highest priority fix.

---

## Critical Findings

### [ ] CRITICAL-001: Authentication Bypass - Majority of API Routes Lack Authentication

**Severity:** CRITICAL
**Category:** Developer Task
**Effort:** High (8-16 hours)

**Issue:**
The majority of API routes (13+ endpoints) accept a `userId` parameter from query strings or request body WITHOUT authenticating the request. An attacker can access, modify, or delete ANY user's data by simply providing their userId.

**Affected Routes (confirmed vulnerable):**
| Route | Methods | Impact |
|-------|---------|--------|
| `/api/users/[id]` | GET | Read any user's profile including email |
| `/api/weigh-ins` | GET, POST | Read/create weigh-ins for any user |
| `/api/weigh-ins/[id]` | PATCH, DELETE | Modify/delete any user's weigh-ins |
| `/api/weigh-ins/latest` | GET | Read any user's latest weigh-in |
| `/api/injections` | GET, POST | Read/create injections for any user |
| `/api/injections/[id]` | PATCH, DELETE | Modify/delete any user's injections |
| `/api/injections/status` | GET | Read any user's injection status |
| `/api/habits` | GET | Read any user's habits |
| `/api/habits/today` | GET, PATCH | Read/modify any user's daily habits |
| `/api/dashboard` | GET | Read any user's complete dashboard |
| `/api/calendar/[year]/[month]` | GET | Read any user's calendar data |

**Evidence:**
```typescript
// src/app/api/injections/route.ts:10-25
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')  // <-- Attacker-controlled!
    // ...
    // NO AUTHENTICATION CHECK
    // ...
    const injections = await prisma.injection.findMany({
      where: { userId },  // <-- Queries attacker's chosen user
```

**Remediation:**
All data endpoints MUST authenticate the request and use the authenticated user's ID:

```typescript
// SECURE: Use authenticated user's ID, ignore any userId from request
import { authenticateRequest } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Use auth.user.id - NEVER accept userId from request params
    const injections = await prisma.injection.findMany({
      where: { userId: auth.user.id },
      // ...
    })
```

**Verification:**
- [ ] Add authentication to all affected routes (see list above)
- [ ] Remove userId parameter acceptance from query/body
- [ ] Write integration tests to verify authentication required
- [ ] Verify all routes return 401 without valid session

---

### [ ] CRITICAL-002: Data Manipulation Without Ownership Verification

**Severity:** CRITICAL
**Category:** Developer Task
**Location:** Multiple routes accepting `userId` in request body
**Effort:** Medium (4-8 hours)

**Issue:**
Routes that modify data accept `userId` in the request body and trust it without verification. An attacker can manipulate any user's data by providing a target userId.

**Evidence:**
```typescript
// src/app/api/injections/route.ts:41-84 (POST handler)
export async function POST(request: NextRequest) {
  const body = await request.json()
  const validated = createInjectionSchema.parse(body)

  // validated.userId comes from attacker-controlled request body!
  const injection = await prisma.injection.create({
    data: {
      userId: validated.userId,  // <-- Can create injections for ANY user
      site: validated.site,
      // ...
    },
  })
```

```typescript
// src/app/api/weigh-ins/[id]/route.ts - PATCH & DELETE
// Takes userId from body/query and uses it for "ownership" check
// But an attacker can provide the victim's userId to pass the check!
const validated = updateWeighInSchema.parse(body)
if (!existing || existing.userId !== validated.userId) {
  // This check is meaningless - attacker controls validated.userId!
```

**Remediation:**
Remove userId from all schemas and derive it from authenticated session:

```typescript
// 1. Update validation schemas - remove userId
export const createInjectionSchema = z.object({
  // userId: z.string().min(1),  <-- REMOVE THIS
  site: injectionSiteEnum,
  doseNumber: doseNumberSchema.optional(),
  // ...
})

// 2. Use authenticated user's ID in route
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  const validated = createInjectionSchema.parse(body)

  const injection = await prisma.injection.create({
    data: {
      userId: auth.user.id,  // <-- From authenticated session
      site: validated.site,
      // ...
    },
  })
```

**Verification:**
- [ ] Remove `userId` field from: `createInjectionSchema`, `updateInjectionSchema`, `createWeighInSchema`, `updateWeighInSchema`, `toggleHabitSchema`, `dashboardQuerySchema`
- [ ] Update all routes to use `auth.user.id`
- [ ] Test that users cannot manipulate other users' data

---

### [ ] CRITICAL-003: Unauthenticated User Profile Access

**Severity:** CRITICAL
**Category:** Developer Task
**Location:** `src/app/api/users/[id]/route.ts`
**Effort:** Low (1-2 hours)

**Issue:**
The `/api/users/[id]` endpoint exposes ANY user's full profile without authentication. This leaks PII including email addresses.

**Evidence:**
```typescript
// src/app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // NO AUTHENTICATION - anyone can query any user ID!
  const user = await prisma.user.findUnique({
    where: { id },
  })

  return NextResponse.json(user)  // <-- Includes email, startWeight, etc.
```

**Remediation:**
Either:
1. Remove this endpoint entirely (use `/api/auth/session` for current user), OR
2. Require authentication and restrict to current user only:

```typescript
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Only return current user's data, ignore the [id] param
  const { passwordHash, ...userWithoutPassword } = auth.user
  return NextResponse.json(userWithoutPassword)
}
```

**Verification:**
- [ ] Endpoint requires authentication
- [ ] Users can only access their own profile
- [ ] No password hash in response

---

### [ ] CRITICAL-004: Default Secret in Production-Risk Code

**Severity:** CRITICAL
**Category:** Developer Task
**Location:** `src/lib/unsubscribe-token.ts:3`
**Effort:** Low (30 minutes)

**Issue:**
The unsubscribe token uses a hardcoded default secret that could be used in production if the environment variable is missing:

```typescript
const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET || 'default-dev-secret'
```

If `UNSUBSCRIBE_SECRET` is not set in production, attackers can forge unsubscribe tokens to disable any user's notifications.

**Remediation:**
Fail fast if secret is missing:

```typescript
const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET
if (!UNSUBSCRIBE_SECRET) {
  throw new Error('UNSUBSCRIBE_SECRET environment variable is required')
}
```

**Verification:**
- [ ] Remove default value
- [ ] Add runtime check that throws on missing secret
- [ ] Verify production has UNSUBSCRIBE_SECRET set
- [ ] Add to deployment checklist

---

## High Findings

### [ ] HIGH-001: No Rate Limiting on Authentication Endpoints

**Severity:** HIGH
**Category:** Developer Task
**Location:** `/api/auth/login`, `/api/users` (registration)
**Effort:** Medium (2-4 hours)

**Issue:**
Login and registration endpoints have no rate limiting, enabling:
- Brute force password attacks
- Credential stuffing attacks
- Account enumeration
- Denial of service

**Remediation:**
Implement rate limiting using a library like `@upstash/ratelimit`:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
})

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        }
      }
    )
  }
  // ... proceed with login
}
```

**Alternative (no Redis):** Use in-memory rate limiting for simpler deployments, but be aware it won't work across multiple instances.

**Verification:**
- [ ] Rate limiting implemented on `/api/auth/login`
- [ ] Rate limiting implemented on `/api/users` (registration)
- [ ] Rate limiting implemented on `/api/settings/password`
- [ ] Returns 429 with appropriate headers when limit exceeded
- [ ] Test with rapid requests to verify limiting works

---

### [ ] HIGH-002: Missing Security Headers

**Severity:** HIGH
**Category:** Developer Task
**Location:** `next.config.ts`
**Effort:** Low (1 hour)

**Issue:**
The application does not configure security headers, leaving it vulnerable to:
- Clickjacking (no X-Frame-Options)
- MIME sniffing attacks (no X-Content-Type-Options)
- Information disclosure (no Referrer-Policy)

**Remediation:**
Add security headers in `next.config.ts`:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

**Verification:**
- [ ] Headers added to next.config.ts
- [ ] Verify headers present with `curl -I https://needled.app`
- [ ] Test with securityheaders.com

---

### [ ] HIGH-003: PostgreSQL Port Exposed to Host

**Severity:** HIGH
**Category:** DevOps Task
**Location:** `docker-compose.infrastructure.yml:17-18`
**Effort:** Low (30 minutes)

**Issue:**
The PostgreSQL database port is mapped to the host, potentially exposing it to the network:

```yaml
ports:
  - "5467:5432"
```

If the server's firewall is misconfigured, the database could be accessible from the internet.

**Remediation:**
Remove the port mapping - apps access the database via Docker's internal network:

```yaml
services:
  db:
    image: postgres:15-alpine
    # Remove: ports: - "5467:5432"
    networks:
      - needled-network
    # ...
```

If local access is needed for development/debugging, bind to localhost only:
```yaml
ports:
  - "127.0.0.1:5467:5432"  # Only accessible from localhost
```

**Verification:**
- [ ] Port mapping removed or bound to 127.0.0.1
- [ ] Application still connects via internal Docker network
- [ ] External port scan confirms 5467 is not accessible

---

### [ ] HIGH-004: Dependency Vulnerability in Next.js

**Severity:** HIGH
**Category:** Developer Task
**Effort:** Low (30 minutes)

**Issue:**
`npm audit` reports high severity vulnerability in the current Next.js version (16.1.4):
- DoS via Image Optimizer remotePatterns configuration
- Unbounded Memory Consumption via PPR Resume Endpoint
- HTTP request deserialization can lead to DoS

**Evidence:**
```
next  15.6.0-canary.0 - 16.1.4
Severity: high
```

**Remediation:**
```bash
npm audit fix
# or specifically:
npm update next
```

**Verification:**
- [ ] Run `npm audit` shows no high/critical vulnerabilities
- [ ] Application still functions correctly after update
- [ ] Run test suite to verify no regressions

---

### [ ] HIGH-005: Very Long Session Expiry (10 Years)

**Severity:** HIGH
**Category:** Developer Task
**Location:** `src/lib/auth.ts:6`
**Effort:** Low (30 minutes)

**Issue:**
Session tokens are set to expire after 10 years:

```typescript
const SESSION_EXPIRY_DAYS = 3650 // ~10 years
```

While the comment says "mobile apps stay logged in until explicit logout," this is excessive. If a session token is compromised, the attacker has a decade to use it.

**Remediation:**
Reduce to a more reasonable duration (e.g., 90 days) with refresh token pattern:

```typescript
const SESSION_EXPIRY_DAYS = 90 // 3 months
```

For mobile apps that need persistent login, implement a refresh token mechanism where:
1. Access tokens expire in 1-7 days
2. Refresh tokens expire in 90-365 days
3. Refresh tokens are rotated on use

**Verification:**
- [ ] Session expiry reduced to reasonable duration
- [ ] Existing sessions still work (or migration plan in place)
- [ ] Mobile app handles re-authentication gracefully

---

## Medium Findings

### [ ] MEDIUM-001: Missing Middleware Protection for API Routes

**Severity:** MEDIUM
**Category:** Developer Task
**Location:** `src/middleware.ts`
**Effort:** Medium (2-4 hours)

**Issue:**
The middleware only protects web page routes, not API routes. API authentication is left to individual route handlers, which has proven unreliable.

**Evidence:**
```typescript
// src/middleware.ts:26-27
// API routes that bypass middleware (auth routes handle their own auth)
const PUBLIC_API_ROUTES = ['/api/auth/']

// Line 32-35: Only /api/auth/ routes skip, but ALL other API routes skip
// authentication in middleware entirely
if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
  return NextResponse.next()
}
```

**Remediation:**
Add API route protection in middleware as defense-in-depth:

```typescript
// Add protected API routes
const PROTECTED_API_ROUTES = [
  '/api/weigh-ins',
  '/api/injections',
  '/api/habits',
  '/api/dashboard',
  '/api/calendar',
  '/api/settings',
  '/api/notifications',
]

// In middleware function, after existing checks:
const isProtectedApiRoute = PROTECTED_API_ROUTES.some(
  (route) => pathname.startsWith(route)
)

if (isProtectedApiRoute) {
  // Check for Bearer token or session cookie
  const authHeader = request.headers.get('authorization')
  const sessionCookie = request.cookies.get('needled_session')

  if (!authHeader?.startsWith('Bearer ') && !sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Note: Full session validation still happens in route handlers
}
```

**Verification:**
- [ ] Middleware rejects unauthenticated API requests
- [ ] Bearer token requests pass through
- [ ] Cookie-based requests pass through
- [ ] Public routes still accessible

---

### [ ] MEDIUM-002: Email Template XSS Risk with User-Controlled Data

**Severity:** MEDIUM
**Category:** Developer Task
**Location:** `src/lib/email-templates/injection-reminder.ts:32-35`
**Effort:** Low (1 hour)

**Issue:**
User-controlled data (userName, medication) is interpolated directly into HTML email templates without escaping:

```typescript
<h1 style="...">
  Time for your ${medication} injection
</h1>
<p style="...">
  Hey ${userName}, today's your injection day!
</p>
```

If a user sets their name to `<script>alert('xss')</script>`, this could be executed in email clients that render HTML.

**Remediation:**
HTML-escape all user-controlled values:

```typescript
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// In template:
Hey ${escapeHtml(userName)}, today's your injection day!
```

**Verification:**
- [ ] HTML escape function created
- [ ] All user-controlled values escaped in email templates
- [ ] Test with malicious input in user name

---

### [ ] MEDIUM-003: No CSRF Protection for Cookie-Based Auth

**Severity:** MEDIUM
**Category:** Developer Task
**Effort:** Medium (2-4 hours)

**Issue:**
The application uses `sameSite: 'lax'` cookies which prevents CSRF on POST requests from external sites, but may not protect against all CSRF scenarios (e.g., GET requests that modify state, or attacks from same-site origins).

**Remediation:**
Consider implementing CSRF tokens for state-changing operations:
1. Generate CSRF token on session creation
2. Include token in response headers or meta tags
3. Require token in state-changing requests
4. Validate token server-side

For API-first applications serving mobile apps, consider requiring Bearer token auth for all state-changing operations (which is inherently CSRF-immune).

**Verification:**
- [ ] CSRF tokens implemented OR Bearer tokens required for mutations
- [ ] Test that cross-origin form submissions are rejected

---

### [ ] MEDIUM-004: Error Messages May Leak Information

**Severity:** MEDIUM
**Category:** Developer Task
**Location:** Multiple API routes
**Effort:** Low (2 hours)

**Issue:**
Some error messages reveal internal details:
- "User not found" vs "Invalid credentials" - can be used for account enumeration
- Detailed Zod validation errors expose schema structure

**Evidence:**
```typescript
// Login route returns different messages:
if (!user) {
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}
// vs
if (!user.passwordHash) {
  return NextResponse.json({
    error: 'This account was created before passwords were required...'
  }, { status: 401 })  // <-- Reveals that account exists!
}
```

**Remediation:**
Use consistent generic error messages:
```typescript
// Always return same message regardless of failure reason
return NextResponse.json(
  { error: 'Invalid email or password' },
  { status: 401 }
)
```

**Verification:**
- [ ] Login returns consistent error message for all auth failures
- [ ] User lookup failures don't reveal whether account exists
- [ ] Zod errors don't leak sensitive schema details

---

### [ ] MEDIUM-005: Missing Database SSL/TLS in Connection String

**Severity:** MEDIUM
**Category:** DevOps Task
**Location:** Docker environment configuration
**Effort:** Low (30 minutes)

**Issue:**
The database connection string doesn't enforce SSL:
```yaml
DATABASE_URL=postgresql://needled:${DB_PASSWORD}@needled-db:5432/needled
```

While connections between Docker containers on the same host are relatively safe, enabling SSL adds defense-in-depth.

**Remediation:**
Add SSL requirement to connection string:
```yaml
DATABASE_URL=postgresql://needled:${DB_PASSWORD}@needled-db:5432/needled?sslmode=require
```

Note: This requires PostgreSQL to be configured with SSL certificates.

**Verification:**
- [ ] SSL mode added to connection string
- [ ] Database configured with SSL certificates
- [ ] Connection still works

---

### [ ] MEDIUM-006: Missing Resource Limits in Docker Compose

**Severity:** MEDIUM
**Category:** DevOps Task
**Location:** `docker-compose.app.yml`
**Effort:** Low (30 minutes)

**Issue:**
No memory or CPU limits are set on containers, allowing a single container to consume all host resources (denial of service risk).

**Remediation:**
Add resource limits:
```yaml
services:
  app:
    # ... existing config ...
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
        reservations:
          memory: 256M
          cpus: '0.5'
```

**Verification:**
- [ ] Resource limits added to app and db services
- [ ] Application functions normally within limits
- [ ] Monitor for OOM kills or throttling

---

## Low Findings

### [ ] LOW-001: Console Logging of Errors in Production

**Severity:** LOW
**Category:** Developer Task
**Location:** Multiple API routes
**Effort:** Low (2 hours)

**Issue:**
`console.error` statements may log sensitive information in production:
```typescript
console.error('Login error:', error)
console.error('Failed to fetch user:', error)
```

**Remediation:**
Use a proper logging library with log levels and consider what information is logged:
```typescript
import { logger } from '@/lib/logger'

logger.error('Login failed', {
  userId: user?.id,  // Only safe fields
  errorType: error.name
  // NOT: error.message which might contain sensitive data
})
```

**Verification:**
- [ ] Review all console.error calls
- [ ] Implement structured logging
- [ ] Ensure no PII/secrets in logs

---

### [ ] LOW-002: Session Token Passed in Response Body

**Severity:** LOW
**Category:** Developer Task
**Location:** `src/app/api/auth/login/route.ts:48`
**Effort:** Low (1 hour)

**Issue:**
The login endpoint returns the session token in the response body:
```typescript
return NextResponse.json({ ...userWithoutPassword, token }, { status: 200 })
```

While needed for mobile apps using Bearer auth, this token could be logged by proxies or client-side JavaScript.

**Remediation:**
For web clients, rely only on httpOnly cookies. For mobile apps, document that the token should be stored securely (iOS Keychain, Android Keystore).

**Verification:**
- [ ] Document secure token storage for mobile apps
- [ ] Consider separate login endpoints for web vs mobile

---

### [ ] LOW-003: Missing Password Complexity Requirements

**Severity:** LOW
**Category:** Developer Task
**Location:** `src/lib/validations/auth.ts:20`
**Effort:** Low (30 minutes)

**Issue:**
Password validation only requires 8 characters minimum:
```typescript
password: z.string().min(8, 'Password must be at least 8 characters')
```

**Remediation:**
Add complexity requirements:
```typescript
password: z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
```

**Verification:**
- [ ] Password complexity requirements added
- [ ] UI displays requirements to users
- [ ] Existing users can still log in

---

### [ ] LOW-004: Cookie MaxAge Inconsistent with Session Expiry

**Severity:** LOW
**Category:** Developer Task
**Location:** `src/lib/cookies.ts:4`
**Effort:** Low (15 minutes)

**Issue:**
Cookie expires in 30 days but session expires in 10 years:
```typescript
const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60 // 30 days
// vs
const SESSION_EXPIRY_DAYS = 3650 // ~10 years
```

**Remediation:**
Align cookie and session expiry (both should be reduced per HIGH-005):
```typescript
const SESSION_EXPIRY_DAYS = 90
const COOKIE_MAX_AGE_SECONDS = SESSION_EXPIRY_DAYS * 24 * 60 * 60
```

**Verification:**
- [ ] Cookie and session expiry aligned
- [ ] Values reduced to reasonable duration

---

## Passed Checks

The following security controls were verified as properly implemented:

- [x] Passwords hashed with bcrypt (cost factor 12)
- [x] Session tokens are cryptographically random (32-byte hex)
- [x] Session cookies set with `httpOnly: true`
- [x] Session cookies set with `secure: true` in production
- [x] Session cookies set with `sameSite: 'lax'`
- [x] Password hash excluded from API responses
- [x] Prisma used for all database queries (no raw SQL)
- [x] Zod validation on all API inputs
- [x] .env files excluded from git
- [x] .env files excluded from Docker build context
- [x] Dockerfile uses multi-stage build
- [x] Docker runs as non-root user (nextjs:nodejs)
- [x] Session expiration is checked on each request
- [x] Expired sessions are automatically cleaned up
- [x] User deletion cascades to related data
- [x] Account deletion requires password confirmation
- [x] Cron endpoint protected by secret token
- [x] Unsubscribe tokens are signed and expire

---

## Recommended Security Tools

### Add to CI/CD Pipeline

| Tool | Purpose | Command | Priority |
|------|---------|---------|----------|
| npm audit | Dependency vulnerabilities | `npm audit --audit-level=high` | High |
| Trivy | Container scanning | `trivy image needled-app:latest` | High |
| eslint-plugin-security | Static analysis | Add to ESLint config | Medium |
| secretlint | Secret detection | `npx secretlint "**/*"` | Medium |

### Infrastructure Monitoring

| Tool | Purpose | Installation |
|------|---------|--------------|
| Fail2ban | Brute force protection | `apt install fail2ban` |
| UFW | Firewall | `apt install ufw` |
| Lynis | System audit | `lynis audit system` |

---

## Action Plan

### Immediate (Fix Before Production)
- [ ] CRITICAL-001: Add authentication to all data API routes
- [ ] CRITICAL-002: Remove userId from request schemas
- [ ] CRITICAL-003: Protect user profile endpoint
- [ ] CRITICAL-004: Remove default unsubscribe secret
- [ ] HIGH-004: Update Next.js to fix vulnerabilities

### This Week
- [ ] HIGH-001: Implement rate limiting on auth endpoints
- [ ] HIGH-002: Add security headers
- [ ] HIGH-003: Remove or restrict database port exposure
- [ ] HIGH-005: Reduce session expiry duration

### Backlog
- [ ] MEDIUM-001 through MEDIUM-006
- [ ] LOW-001 through LOW-004

### Recurring
- [ ] Weekly: Run `npm audit` and review for new vulnerabilities
- [ ] Monthly: Review access logs for anomalies
- [ ] Quarterly: Re-run this security audit
- [ ] Quarterly: Rotate secrets (CRON_SECRET, UNSUBSCRIBE_SECRET)

---

## Appendix: Routes Requiring Authentication Fix

For reference, here is the complete list of files requiring authentication:

| File | Current State | Required Action |
|------|---------------|-----------------|
| `src/app/api/users/[id]/route.ts` | No auth | Add auth, restrict to self |
| `src/app/api/weigh-ins/route.ts` | No auth | Add auth |
| `src/app/api/weigh-ins/[id]/route.ts` | No auth | Add auth |
| `src/app/api/weigh-ins/latest/route.ts` | No auth | Add auth |
| `src/app/api/weigh-ins/progress/route.ts` | No auth | Add auth |
| `src/app/api/injections/route.ts` | No auth | Add auth |
| `src/app/api/injections/[id]/route.ts` | No auth | Add auth |
| `src/app/api/injections/status/route.ts` | No auth | Add auth |
| `src/app/api/habits/route.ts` | No auth | Add auth |
| `src/app/api/habits/today/route.ts` | No auth | Add auth |
| `src/app/api/dashboard/route.ts` | No auth | Add auth |
| `src/app/api/calendar/[year]/[month]/route.ts` | No auth | Add auth |
| `src/app/api/calendar/day/[date]/route.ts` | No auth | Add auth |

Routes with authentication already implemented (verify these are correct):
- `src/app/api/settings/route.ts` - OK
- `src/app/api/settings/profile/route.ts` - OK
- `src/app/api/settings/email/route.ts` - OK
- `src/app/api/settings/password/route.ts` - OK
- `src/app/api/settings/account/route.ts` - OK
- `src/app/api/settings/export/route.ts` - OK
- `src/app/api/auth/session/route.ts` - OK
- `src/app/api/notifications/preferences/route.ts` - OK
- `src/app/api/notifications/test/route.ts` - OK

Public routes (should NOT require auth):
- `src/app/api/auth/login/route.ts` - Public (login endpoint)
- `src/app/api/auth/logout/route.ts` - Public (allows unauthenticated logout)
- `src/app/api/users/route.ts` - Public (registration)
- `src/app/api/beta-testers/route.ts` - Public (beta signup)
- `src/app/api/cron/notifications/route.ts` - Protected by CRON_SECRET
- `src/app/api/notifications/unsubscribe/route.ts` - Protected by signed token
