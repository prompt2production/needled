# Login & Session Management

## Overview

Enable users to log in and maintain authenticated sessions so they can return to the app without re-entering their profile information. When a user with an active session visits the home page, they should be automatically redirected to the dashboard.

This is a **local-first** feature with no cloud sync. User data stays on the device, but sessions provide a secure way to persist access across browser visits.

## User Stories

### As a new user
- I want to set a password during onboarding so I can securely access my account later
- I want my email to be required (not optional) so I can use it to log in

### As a returning user
- I want to log in with my email and password so I can access my data
- I want to be automatically redirected to the dashboard if I'm already logged in
- I want to stay logged in across browser sessions until I explicitly log out

### As an authenticated user
- I want to log out when I'm done so others can't access my data on a shared device
- I want all my routes to be protected so unauthenticated users can't see my data

## Requirements

### Database Changes

1. **User Model Updates**
   - Make `email` required (currently optional)
   - Add `passwordHash` field for storing bcrypt-hashed passwords

2. **Session Model**
   - Add `Session` model for server-side session management
   - Track session token, user ID, expiry date
   - Support session invalidation on logout

### Authentication Flow

1. **Registration (During Onboarding)**
   - Collect email and password as part of user onboarding
   - Password requirements: minimum 8 characters
   - Hash password with bcrypt before storing
   - Create session after successful registration
   - Set HTTP-only secure cookie with session token

2. **Login**
   - Email/password form
   - Validate credentials against stored hash
   - Create new session on successful login
   - Redirect to dashboard

3. **Session Management**
   - Sessions stored in database (not JWT)
   - Session token in HTTP-only cookie
   - Session expiry: 30 days
   - Auto-extend session on activity

4. **Logout**
   - Delete session from database
   - Clear session cookie
   - Redirect to home page

### Route Protection

1. **Protected Routes** (require authentication)
   - `/dashboard`
   - `/weigh-in/*`
   - `/injection/*`
   - `/habits/*`
   - `/calendar`
   - `/settings`

2. **Public Routes**
   - `/` (home page - redirects to dashboard if logged in)
   - `/login`
   - `/onboarding/*` (but onboarding creates a session)

3. **Middleware**
   - Check for valid session on protected routes
   - Redirect to `/login` if no valid session
   - Redirect logged-in users from `/` to `/dashboard`

### UI Components

1. **Login Page** (`/login`)
   - Email input
   - Password input
   - "Log in" button
   - Link to onboarding for new users
   - Error messages for invalid credentials
   - Loading state during authentication

2. **Updated Onboarding**
   - Add email field (required)
   - Add password field with confirmation
   - Create session after profile creation

3. **Logout Button**
   - Add to header navigation (user dropdown or explicit button)
   - Confirmation not required (instant logout)

### API Endpoints

1. **POST /api/auth/login**
   - Body: `{ email, password }`
   - Success: Set session cookie, return user data
   - Failure: Return 401 with error message

2. **POST /api/auth/logout**
   - Clear session cookie
   - Delete session from database
   - Return success

3. **GET /api/auth/session**
   - Return current session/user info if authenticated
   - Return 401 if not authenticated

4. **Update POST /api/users**
   - Require `email` and `password` in body
   - Hash password before storing
   - Create session after user creation

### Security Considerations

- Passwords hashed with bcrypt (cost factor 12)
- Session tokens are cryptographically random (32 bytes, hex encoded)
- HTTP-only cookies to prevent XSS access
- Secure cookies in production (HTTPS only)
- SameSite=Lax to prevent CSRF
- Rate limiting on login attempts (future enhancement)

## Out of Scope

- Password reset / forgot password (no email sending in MVP)
- OAuth / social login
- Multi-device sync
- Remember me checkbox (always remember)
- Account deletion from login screen

## UI/UX Notes

- Login page follows DESIGN_SYSTEM.md patterns
- Form validation shows inline errors
- Loading spinner on submit button during authentication
- Toast notification on successful login/logout
- Redirect preserves intended destination after login

## Technical Notes

- Use `@/lib/auth.ts` for authentication utilities
- Use Next.js middleware for route protection
- Session validation happens server-side on each request
- Cookie name: `needled_session`
