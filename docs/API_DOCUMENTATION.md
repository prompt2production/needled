# Needled API Documentation

Version: 1.0
Base URL: `https://your-domain.com/api`

---

## Overview

Needled is a weight loss journey companion app for people using GLP-1 medications (Ozempic, Wegovy, Mounjaro, Zepbound). The API provides endpoints for:

- **User management** - Registration, authentication, profile settings
- **Weight tracking** - Weekly weigh-ins with history and progress
- **Injection tracking** - Weekly injection logging with site rotation and dose tracking
- **Daily habits** - Water, nutrition, and exercise check-ins
- **Dashboard** - Aggregated progress data
- **Calendar** - Monthly and daily activity views
- **Notifications** - Reminder preferences

---

## Authentication

The API supports **dual authentication** for both web and native app clients:

### Web App (Cookie Auth)

The web app uses HTTP-only session cookies. After login, a `needled_session` cookie is set automatically. No additional action is required for web clients.

### Native App (Bearer Token Auth)

For native apps (iOS/Android):

1. **Login**: Call `POST /api/auth/login` and extract the `token` field from the response:
```json
{
  "id": "cuid",
  "name": "John Doe",
  "email": "john@example.com",
  ...
  "token": "64-character-hex-string"
}
```

2. **Store token**: Securely store the token in the device keychain/keystore:
   - **iOS**: Keychain Services
   - **Android**: EncryptedSharedPreferences or Android Keystore

3. **Send token**: Include the token in the `Authorization` header for all authenticated requests:
```
Authorization: Bearer <token>
```

### Auth Priority

When both Bearer token and cookie are present, the API prioritizes Bearer token authentication. This allows native apps to work correctly even if cookies are present.

### Session Details

- Sessions expire after **30 days**
- Tokens are 64-character hex strings (32 bytes)
- Invalid/expired tokens return `401 Unauthorized`

---

## Error Responses

All endpoints return errors in a consistent format:

### Validation Error (400)
```json
{
  "error": [
    {
      "code": "too_small",
      "minimum": 2,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "Name must be at least 2 characters",
      "path": ["name"]
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "error": "Not authenticated"
}
```

### Not Found (404)
```json
{
  "error": "User not found"
}
```

### Conflict (409)
```json
{
  "error": "Email already exists"
}
```

### Server Error (500)
```json
{
  "error": "Internal server error"
}
```

---

## Data Types & Enums

### WeightUnit
```typescript
type WeightUnit = "kg" | "lbs"
```

### Medication
```typescript
type Medication = "OZEMPIC" | "WEGOVY" | "MOUNJARO" | "ZEPBOUND" | "OTHER"
```

### InjectionSite
```typescript
type InjectionSite =
  | "ABDOMEN_LEFT"
  | "ABDOMEN_RIGHT"
  | "THIGH_LEFT"
  | "THIGH_RIGHT"
  | "UPPER_ARM_LEFT"
  | "UPPER_ARM_RIGHT"
```

### HabitType
```typescript
type HabitType = "water" | "nutrition" | "exercise"
```

### InjectionStatus
```typescript
type InjectionStatus = "due" | "done" | "overdue" | "upcoming"
```

### InjectionDay
```typescript
// 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
type InjectionDay = 0 | 1 | 2 | 3 | 4 | 5 | 6
```

### DoseNumber
```typescript
// GLP-1 pens contain 4 doses
type DoseNumber = 1 | 2 | 3 | 4
```

---

## Endpoints

### Authentication

#### POST /api/users
Register a new user account.

**Request Body:**
```json
{
  "name": "string (2-30 chars, required)",
  "email": "string (valid email, required)",
  "password": "string (min 8 chars, required)",
  "startWeight": "number (40-300, required)",
  "goalWeight": "number (40-300, optional, must be < startWeight)",
  "weightUnit": "kg | lbs (required)",
  "medication": "OZEMPIC | WEGOVY | MOUNJARO | ZEPBOUND | OTHER (required)",
  "injectionDay": "number (0-6, required, 0=Monday)"
}
```

**Response (201 Created):**
```json
{
  "id": "cuid",
  "name": "John Doe",
  "email": "john@example.com",
  "startWeight": 100,
  "goalWeight": 80,
  "weightUnit": "kg",
  "medication": "OZEMPIC",
  "injectionDay": 2,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Errors:**
- `400` - Validation error
- `409` - Email already exists

---

#### POST /api/auth/login
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "string (valid email, required)",
  "password": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "id": "cuid",
  "name": "John Doe",
  "email": "john@example.com",
  "startWeight": 100,
  "goalWeight": 80,
  "weightUnit": "kg",
  "medication": "OZEMPIC",
  "injectionDay": 2,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "token": "64-character-hex-session-token"
}
```

**Errors:**
- `400` - Validation error
- `401` - Invalid credentials

**Notes:**
- Web clients: A `needled_session` cookie is also set automatically
- Native clients: Extract and securely store the `token` field for subsequent API calls

---

#### GET /api/auth/session
Get current authenticated user from session.

**Headers:**
```
Authorization: Bearer <session_token>
```

**Response (200 OK):**
```json
{
  "id": "cuid",
  "name": "John Doe",
  "email": "john@example.com",
  "startWeight": 100,
  "goalWeight": 80,
  "weightUnit": "kg",
  "medication": "OZEMPIC",
  "injectionDay": 2,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Errors:**
- `401` - Not authenticated

---

#### POST /api/auth/logout
End the current session.

**Headers:**
```
Authorization: Bearer <session_token>
```

**Response (200 OK):**
```json
{
  "success": true
}
```

---

### User Profile

#### GET /api/users/{id}
Get a user by ID.

**Response (200 OK):**
```json
{
  "id": "cuid",
  "name": "John Doe",
  "email": "john@example.com",
  "startWeight": 100,
  "goalWeight": 80,
  "weightUnit": "kg",
  "medication": "OZEMPIC",
  "injectionDay": 2,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Errors:**
- `404` - User not found

---

### Settings (Authenticated)

All settings endpoints require authentication.

#### GET /api/settings
Get current user's profile settings.

**Response (200 OK):**
```json
{
  "id": "cuid",
  "name": "John Doe",
  "email": "john@example.com",
  "goalWeight": 80,
  "weightUnit": "kg",
  "medication": "OZEMPIC",
  "injectionDay": 2
}
```

---

#### PUT /api/settings/profile
Update profile settings.

**Request Body:**
```json
{
  "name": "string (2-30 chars, required)",
  "goalWeight": "number (40-300, optional, nullable)",
  "medication": "OZEMPIC | WEGOVY | MOUNJARO | ZEPBOUND | OTHER (required)",
  "injectionDay": "number (0-6, required)"
}
```

**Response (200 OK):**
```json
{
  "id": "cuid",
  "name": "John Doe",
  "email": "john@example.com",
  "goalWeight": 75,
  "weightUnit": "kg",
  "medication": "WEGOVY",
  "injectionDay": 3
}
```

---

#### PUT /api/settings/email
Update email address.

**Request Body:**
```json
{
  "email": "string (valid email, required)"
}
```

**Response (200 OK):**
```json
{
  "message": "Email updated successfully"
}
```

**Errors:**
- `409` - Email already in use

---

#### PUT /api/settings/password
Change password.

**Request Body:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (min 8 chars, required)",
  "confirmPassword": "string (must match newPassword, required)"
}
```

**Response (200 OK):**
```json
{
  "message": "Password updated successfully"
}
```

**Errors:**
- `400` - Current password incorrect / Passwords don't match

---

#### GET /api/settings/export
Export all user data as JSON file.

**Response (200 OK):**

Headers:
```
Content-Type: application/json
Content-Disposition: attachment; filename="needled-export-2024-01-15.json"
```

Body:
```json
{
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "exportVersion": "1.0",
  "user": {
    "profile": {
      "id": "cuid",
      "name": "John Doe",
      "email": "john@example.com",
      "startWeight": 100,
      "goalWeight": 80,
      "weightUnit": "kg",
      "medication": "OZEMPIC",
      "injectionDay": 2,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "notificationPreferences": { ... }
  },
  "weighIns": [ ... ],
  "injections": [ ... ],
  "dailyHabits": [ ... ]
}
```

---

#### DELETE /api/settings/account
Delete user account and all associated data.

**Request Body:**
```json
{
  "password": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "message": "Account deleted successfully"
}
```

**Errors:**
- `400` - Incorrect password

---

### Weigh-ins

#### GET /api/weigh-ins
Get weigh-in history.

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| userId | string | Yes | - | User ID |
| limit | number | No | 10 | Max 100 |
| offset | number | No | 0 | Pagination offset |

**Response (200 OK):**
```json
[
  {
    "id": "cuid",
    "userId": "cuid",
    "weight": 98.5,
    "date": "2024-01-15T12:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

#### POST /api/weigh-ins
Create a new weigh-in.

**Request Body:**
```json
{
  "userId": "string (required)",
  "weight": "number (40-300, required)",
  "date": "string (YYYY-MM-DD, optional, defaults to today)"
}
```

**Response (201 Created):**
```json
{
  "id": "cuid",
  "userId": "cuid",
  "weight": 98.5,
  "date": "2024-01-15T12:00:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

#### GET /api/weigh-ins/latest
Get latest weigh-in with calculated stats.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID |

**Response (200 OK):**
```json
{
  "weighIn": {
    "id": "cuid",
    "weight": 98.5,
    "date": "2024-01-15T12:00:00.000Z"
  },
  "weekChange": -0.5,
  "totalChange": -1.5,
  "canWeighIn": true,
  "hasWeighedThisWeek": false
}
```

If no weigh-ins exist:
```json
{
  "weighIn": null,
  "weekChange": null,
  "totalChange": null,
  "canWeighIn": true,
  "hasWeighedThisWeek": false
}
```

---

#### PATCH /api/weigh-ins/{id}
Update a weigh-in.

**Request Body:**
```json
{
  "userId": "string (required for authorization)",
  "weight": "number (40-300, optional)",
  "date": "string (YYYY-MM-DD, optional)"
}
```

**Response (200 OK):**
```json
{
  "id": "cuid",
  "userId": "cuid",
  "weight": 98.0,
  "date": "2024-01-15T12:00:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

#### DELETE /api/weigh-ins/{id}
Delete a weigh-in.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID (for authorization) |

**Response (204 No Content)**

---

### Injections

#### GET /api/injections
Get injection history.

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| userId | string | Yes | - | User ID |
| limit | number | No | 10 | Max 100 |
| offset | number | No | 0 | Pagination offset |

**Response (200 OK):**
```json
[
  {
    "id": "cuid",
    "userId": "cuid",
    "date": "2024-01-15T12:00:00.000Z",
    "site": "ABDOMEN_LEFT",
    "doseNumber": 2,
    "notes": "Slight bruising",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

#### POST /api/injections
Log a new injection.

**Request Body:**
```json
{
  "userId": "string (required)",
  "site": "ABDOMEN_LEFT | ABDOMEN_RIGHT | THIGH_LEFT | THIGH_RIGHT | UPPER_ARM_LEFT | UPPER_ARM_RIGHT (required)",
  "doseNumber": "number (1-4, optional, auto-calculated if omitted)",
  "notes": "string (max 500 chars, optional)",
  "date": "string (YYYY-MM-DD, optional, defaults to today)"
}
```

**Response (201 Created):**
```json
{
  "id": "cuid",
  "userId": "cuid",
  "date": "2024-01-15T12:00:00.000Z",
  "site": "ABDOMEN_LEFT",
  "doseNumber": 2,
  "notes": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

#### GET /api/injections/status
Get current injection status with recommendations.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID |

**Response (200 OK):**
```json
{
  "status": "due | done | overdue | upcoming",
  "daysUntil": 0,
  "daysOverdue": 0,
  "lastInjection": {
    "id": "cuid",
    "site": "ABDOMEN_LEFT",
    "doseNumber": 2,
    "date": "2024-01-08T12:00:00.000Z",
    "notes": null
  },
  "suggestedSite": "ABDOMEN_RIGHT",
  "currentDose": 2,
  "nextDose": 3,
  "dosesRemaining": 2
}
```

**Status Logic:**
- `due` - Today is injection day and not yet logged
- `done` - Injection logged for current injection week
- `overdue` - Past injection day, not yet logged
- `upcoming` - Before injection day in current week

**Dose Tracking:**
- `currentDose` - Last injection's dose number (null if no history)
- `nextDose` - Calculated next dose (1-4, wraps around)
- `dosesRemaining` - Doses left in current pen (4 - currentDose, or 4 if starting new pen)

---

#### PATCH /api/injections/{id}
Update an injection.

**Request Body:**
```json
{
  "userId": "string (required for authorization)",
  "site": "InjectionSite (optional)",
  "doseNumber": "number (1-4, optional)",
  "notes": "string (max 500 chars, optional)",
  "date": "string (YYYY-MM-DD, optional)"
}
```

**Response (200 OK):** Updated injection object

---

#### DELETE /api/injections/{id}
Delete an injection.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID (for authorization) |

**Response (204 No Content)**

---

### Daily Habits

#### GET /api/habits
Get habit history.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID |
| startDate | string | No | YYYY-MM-DD format |
| endDate | string | No | YYYY-MM-DD format |

**Response (200 OK):**
```json
[
  {
    "id": "cuid",
    "userId": "cuid",
    "date": "2024-01-15T00:00:00.000Z",
    "water": true,
    "nutrition": true,
    "exercise": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

#### GET /api/habits/today
Get or create today's habit record.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID |

**Response (200 OK):**
```json
{
  "id": "cuid",
  "userId": "cuid",
  "date": "2024-01-15T00:00:00.000Z",
  "water": false,
  "nutrition": false,
  "exercise": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

#### PATCH /api/habits/today
Toggle a habit for today (or a specific date).

**Request Body:**
```json
{
  "userId": "string (required)",
  "habit": "water | nutrition | exercise (required)",
  "value": "boolean (required)",
  "date": "string (YYYY-MM-DD, optional, defaults to today)"
}
```

**Constraints:**
- Cannot log future dates
- Cannot log dates more than 90 days in the past

**Response (200 OK):**
```json
{
  "id": "cuid",
  "userId": "cuid",
  "date": "2024-01-15T00:00:00.000Z",
  "water": true,
  "nutrition": false,
  "exercise": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

---

### Dashboard

#### GET /api/dashboard
Get aggregated dashboard data.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID |

**Response (200 OK):**
```json
{
  "user": {
    "id": "cuid",
    "name": "John Doe",
    "startWeight": 100,
    "goalWeight": 80,
    "weightUnit": "kg",
    "medication": "OZEMPIC",
    "injectionDay": 2,
    "createdAt": "2024-01-01T10:30:00.000Z"
  },
  "weight": {
    "currentWeight": 98.5,
    "previousWeight": 99.0,
    "weekChange": -0.5,
    "totalLost": 1.5,
    "progressPercent": 7.5,
    "weighInCount": 3,
    "canWeighIn": true
  },
  "habits": {
    "weeklyCompletionPercent": 67,
    "todayCompleted": 2,
    "todayTotal": 3
  },
  "journey": {
    "weekNumber": 3,
    "startDate": "2024-01-01T10:30:00.000Z"
  }
}
```

**Calculated Fields:**
- `progressPercent` - Percentage toward goal weight (0-100)
- `weeklyCompletionPercent` - Habit completion for current week
- `weekNumber` - Weeks since user started journey

---

### Calendar

#### GET /api/calendar/{year}/{month}
Get all activity data for a month.

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| year | number | 4-digit year (e.g., 2024) |
| month | number | Month 1-12 |

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID |

**Response (200 OK):**
```json
{
  "habits": [
    {
      "date": "2024-01-15",
      "water": true,
      "nutrition": true,
      "exercise": false
    }
  ],
  "weighIns": [
    {
      "date": "2024-01-15",
      "weight": 98.5
    }
  ],
  "injections": [
    {
      "date": "2024-01-15",
      "site": "ABDOMEN_LEFT"
    }
  ]
}
```

---

#### GET /api/calendar/day/{date}
Get detailed activity data for a specific day.

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| date | string | YYYY-MM-DD format |

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID |

**Response (200 OK):**
```json
{
  "date": "2024-01-15",
  "habit": {
    "water": true,
    "nutrition": true,
    "exercise": false
  },
  "weighIn": {
    "weight": 98.5,
    "change": -0.5
  },
  "injection": {
    "site": "ABDOMEN_LEFT"
  }
}
```

If no data exists for a field, it returns `null`:
```json
{
  "date": "2024-01-15",
  "habit": null,
  "weighIn": null,
  "injection": null
}
```

---

### Notification Preferences (Authenticated)

#### GET /api/notifications/preferences
Get notification preferences (creates defaults if none exist).

**Response (200 OK):**
```json
{
  "id": "cuid",
  "userId": "cuid",
  "injectionReminder": true,
  "weighInReminder": true,
  "habitReminder": false,
  "reminderTime": "09:00",
  "habitReminderTime": "20:00",
  "timezone": "Europe/London",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

#### PUT /api/notifications/preferences
Update notification preferences.

**Request Body:**
```json
{
  "injectionReminder": "boolean (required)",
  "weighInReminder": "boolean (required)",
  "habitReminder": "boolean (required)",
  "reminderTime": "string (HH:mm format, required)",
  "habitReminderTime": "string (HH:mm format, required)",
  "timezone": "string (IANA timezone, required)"
}
```

**Response (200 OK):** Updated preferences object

---

## Implementation Notes for Native Apps

### 1. Authentication

The API supports Bearer token authentication for native apps. The login endpoint returns the session token:

```json
{
  "id": "cuid",
  "name": "John Doe",
  ...
  "token": "64-character-hex-session-token"
}
```

### 2. Token Storage

Store the session token securely:
- **iOS**: Keychain Services
- **Android**: EncryptedSharedPreferences or Android Keystore

### 3. Request Headers

Include on all authenticated requests:
```
Authorization: Bearer <session_token>
Content-Type: application/json
```

### 4. Date Handling

- All dates in responses are ISO 8601 format (UTC)
- Date-only fields (e.g., `date` in requests) use `YYYY-MM-DD` format
- The API stores weigh-in and injection dates at noon UTC to avoid timezone issues

### 5. Pagination

For list endpoints, use `limit` and `offset` query parameters:
```
GET /api/weigh-ins?userId=xxx&limit=20&offset=0
```

### 6. Offline Support

Consider implementing:
- Local caching of user profile and recent data
- Queued mutations when offline
- Sync on reconnection

### 7. Push Notifications

The web app uses email notifications via SendGrid. For native push notifications:
- Implement device token registration endpoint
- Add push notification service (FCM/APNs)
- Map existing notification preferences to push categories

---

## Rate Limiting

Currently no rate limiting is implemented. Consider implementing on your infrastructure:
- 100 requests/minute for authenticated users
- 10 requests/minute for login/register endpoints

---

## Changelog

### v1.0 (Initial Release)
- User registration and authentication
- Weight tracking with history
- Injection tracking with site rotation and dose tracking
- Daily habit check-ins
- Dashboard aggregation
- Calendar views
- Notification preferences
- Profile settings and account management
