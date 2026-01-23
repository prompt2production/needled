# Login & Session Management

## Overview

This feature adds email-based authentication and proper HTTP-only cookie session management to replace the current localStorage-based user identification. Users can log back in from any device using their email address, and sessions persist securely across browser sessions.

## Current State

- User identification relies on `localStorage.getItem('userId')`
- No email field on User model
- Login page (/login) shows "No account found" with no actual login capability
- No session expiry or security considerations
- Data is device-locked—users cannot access their data from another device

## Goals

1. Allow returning users to log in via email
2. Secure session management using HTTP-only cookies
3. Automatic session validation on protected routes
4. Seamless migration from localStorage to cookie sessions
5. Clean logout functionality

## User Stories

### For New Users
- During onboarding, provide email address (required, unique)
- After onboarding, automatically logged in with session cookie
- No change to existing onboarding UX beyond adding email field

### For Returning Users
- Visit /login and enter email address
- If email exists, logged in and redirected to /home
- If email doesn't exist, shown helpful message with link to onboarding

### For Logged-In Users
- Session persists across browser closes (30-day expiry)
- Can log out from profile page
- If session expires, redirected to login page

## Detailed Requirements

### Database Changes

Add to User model:
```prisma
model User {
  // ... existing fields
  email String @unique
}
```

Add Session model:
```prisma
model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
}
```

### API Endpoints

#### POST /api/auth/login
Request:
```json
{
  "email": "user@example.com"
}
```

Success Response (200):
- Sets HTTP-only cookie `session` with token
- Returns user data (id, name)

Error Response (404):
```json
{
  "error": "No account found with this email"
}
```

#### POST /api/auth/logout
- Clears session cookie
- Deletes session from database
- Returns 200 OK

#### GET /api/auth/session
- Validates current session from cookie
- Returns user data if valid session
- Returns 401 if no valid session

#### Updates to POST /api/users
- Now requires `email` field
- Creates session and sets cookie on successful creation
- Returns user data with session cookie set

### Session Cookie Specification

- Name: `needled_session`
- Value: Random 32-byte token (base64 encoded)
- HttpOnly: true
- Secure: true (in production)
- SameSite: Lax
- Path: /
- MaxAge: 30 days (2592000 seconds)

### Validation Schema

```typescript
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const createUserSchema = z.object({
  // ... existing fields
  email: z.string().email('Please enter a valid email address'),
})
```

### UI Changes

#### Onboarding Page (/onboarding)
- Add email input field after name field
- Label: "Email"
- Placeholder: "you@example.com"
- Required field with email validation
- Error message: "Please enter a valid email address"

#### Login Page (/login)
- Replace current "No account found" static page with login form
- Email input field
- "Log in" button (primary, lime)
- Loading state while checking
- Error state if email not found
- Success: redirect to /home

#### Landing Page (/)
- Remove localStorage check
- Check session via /api/auth/session
- If valid session, redirect to /home
- If no session, show landing page

#### Profile Page (/profile)
- Add "Log out" button at bottom
- Confirmation dialog before logout
- On logout, redirect to landing page

#### Protected Route Wrapper
Create a `useAuth` hook or `AuthProvider`:
- Checks session on mount
- Provides `user`, `isLoading`, `isAuthenticated`
- Redirects to /login if not authenticated

### Migration Strategy

For existing users (localStorage migration):
1. On first load with localStorage userId but no cookie
2. Prompt user to add email to migrate their account
3. Once email added, create session and clear localStorage
4. This is a one-time migration flow

### Security Considerations

- Email is the only credential (no password for MVP)
- Session tokens are cryptographically random
- Sessions stored in database (can be revoked)
- HTTP-only cookies prevent XSS token theft
- CSRF protection via SameSite=Lax
- Session expiry after 30 days of inactivity

### Error Handling

| Scenario | Behaviour |
|----------|-----------|
| Invalid email format | Form validation error |
| Email not found | "No account found" with link to onboarding |
| Session expired | Redirect to /login with message |
| Network error | Toast error, allow retry |

### Testing Requirements

#### Unit Tests
- Login validation schema
- Session token generation
- Cookie parsing utilities

#### E2E Tests
- Complete login flow (email → redirect)
- Failed login (wrong email)
- Session persistence (login, close browser, reopen)
- Logout flow
- Onboarding with email
- Protected route redirect

## Out of Scope

- Password authentication
- Magic link/email verification
- OAuth (Google, Apple sign-in)
- Multi-device session management UI
- "Remember me" toggle (always remembers for 30 days)

## Definition of Done

1. Users can log in with email
2. Sessions persist via HTTP-only cookies
3. All protected routes validate session
4. Logout works correctly
5. Onboarding collects and stores email
6. Existing localStorage users can migrate
7. All tests pass
8. No TypeScript errors
9. Works on desktop and mobile viewports
