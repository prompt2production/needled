# Native App Integration Guide

This guide provides practical implementation advice for building iOS and Android apps that consume the Needled API.

---

## Quick Start

### 1. Base Configuration

```
Production API: https://your-domain.com/api
Content-Type: application/json
```

### 2. Authentication Flow

```
1. User enters email + password
2. POST /api/auth/login
3. Store session token securely
4. Include token in all subsequent requests
```

### 3. Core User Journey

```
App Launch
    ├── Check stored token
    │   ├── Valid → GET /api/auth/session → Home
    │   └── Invalid/None → Login Screen
    │
Login/Register
    ├── POST /api/auth/login (existing user)
    └── POST /api/users (new user, includes onboarding data)
```

---

## Authentication Implementation

### Bearer Token Support

The API supports both cookie-based authentication (web) and Bearer token authentication (native apps).

**Login response includes token:**
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
  "token": "64-character-hex-string"
}
```

**Include token in all authenticated requests:**
```
Authorization: Bearer <token>
```

### Token Storage

| Platform | Recommended Storage |
|----------|-------------------|
| iOS | Keychain Services with `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` |
| Android | EncryptedSharedPreferences (API 23+) |

### Session Refresh

Sessions expire after 30 days. Handle `401 Unauthorized` responses by:
1. Clearing stored token
2. Redirecting to login screen
3. Showing "Session expired" message

---

## Onboarding Flow

New users complete a multi-step onboarding. Collect all data before making the registration API call.

### Onboarding Steps

1. **Welcome** - Introduction screen
2. **Name** - User's display name (2-30 characters)
3. **Start Weight** - Current weight (40-300 in chosen unit)
4. **Goal Weight** - Target weight (optional, must be < start weight)
5. **Medication** - GLP-1 medication being used
6. **Injection Day** - Preferred weekly injection day

### Registration Request

```json
POST /api/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "startWeight": 100,
  "goalWeight": 80,
  "weightUnit": "kg",
  "medication": "OZEMPIC",
  "injectionDay": 2
}
```

### Field Constraints

| Field | Type | Constraints |
|-------|------|-------------|
| name | string | 2-30 chars, trimmed |
| email | string | Valid email format |
| password | string | Min 8 characters |
| startWeight | number | 40-300 |
| goalWeight | number | 40-300, must be < startWeight, nullable |
| weightUnit | enum | "kg" or "lbs" |
| medication | enum | OZEMPIC, WEGOVY, MOUNJARO, ZEPBOUND, OTHER |
| injectionDay | number | 0-6 (0=Monday, 6=Sunday) |

---

## Home Screen / Dashboard

Fetch dashboard data on app launch after authentication.

### API Call

```
GET /api/dashboard?userId={userId}
```

### Response Structure

```json
{
  "user": { ... },
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

### UI Components

| Data | UI Element |
|------|------------|
| progressPercent | Circular progress ring |
| weekChange | "+/- X kg this week" badge |
| totalLost | "X kg lost total" stat |
| weeklyCompletionPercent | Habit streak indicator |
| weekNumber | "Week X of your journey" |

---

## Weight Tracking

### Weekly Weigh-in Card

Show different states based on `canWeighIn`:

```
canWeighIn: true  → "Log This Week's Weight" button
canWeighIn: false → "Logged ✓" with weight display
```

### Logging a Weigh-in

```json
POST /api/weigh-ins
{
  "userId": "user_id",
  "weight": 98.5,
  "date": "2024-01-15"  // Optional, defaults to today
}
```

### Editing a Weigh-in

```json
PATCH /api/weigh-ins/{id}
{
  "userId": "user_id",
  "weight": 98.0
}
```

### Weight History

```
GET /api/weigh-ins?userId={userId}&limit=20&offset=0
```

Order by date descending (most recent first).

---

## Injection Tracking

### Injection Status Card

Call status endpoint to determine UI state:

```
GET /api/injections/status?userId={userId}
```

### Status States

| Status | UI Treatment |
|--------|--------------|
| `upcoming` | "X days until injection day" |
| `due` | "Today is injection day!" - highlight |
| `overdue` | "X days overdue" - warning style |
| `done` | "Completed ✓" with injection details |

### Site Rotation

The API provides `suggestedSite` based on rotation logic:
```
ABDOMEN_LEFT → ABDOMEN_RIGHT → THIGH_LEFT → THIGH_RIGHT → UPPER_ARM_LEFT → UPPER_ARM_RIGHT → (repeat)
```

Show the suggested site prominently, but allow user override.

### Dose Tracking

GLP-1 pens contain 4 doses. The API tracks:
- `currentDose` - Last used dose (1-4)
- `nextDose` - Suggested next dose
- `dosesRemaining` - Doses left in current pen

Display: "Dose 3 of 4 remaining" or "Time for a new pen!"

### Logging an Injection

```json
POST /api/injections
{
  "userId": "user_id",
  "site": "ABDOMEN_RIGHT",
  "doseNumber": 3,
  "notes": "Optional notes"
}
```

If `doseNumber` is omitted, it auto-calculates based on history.

---

## Daily Habits

Three habits tracked daily:
- **Water** - Adequate hydration
- **Nutrition** - Mindful eating
- **Exercise** - Physical activity

### Today's Habits

```
GET /api/habits/today?userId={userId}
```

Returns current state or creates default (all false).

### Toggling a Habit

```json
PATCH /api/habits/today
{
  "userId": "user_id",
  "habit": "water",
  "value": true
}
```

### Past Date Logging

Users can log habits for past dates (up to 90 days ago):

```json
PATCH /api/habits/today
{
  "userId": "user_id",
  "habit": "exercise",
  "value": true,
  "date": "2024-01-14"
}
```

---

## Calendar View

### Monthly Data

```
GET /api/calendar/2024/1?userId={userId}
```

Returns arrays of habits, weigh-ins, and injections for the month.

### Day Detail

When user taps a day:
```
GET /api/calendar/day/2024-01-15?userId={userId}
```

### Visual Indicators

| Data Type | Calendar Indicator |
|-----------|-------------------|
| Habit (all 3) | Full green dot |
| Habit (partial) | Partial green dot |
| Weigh-in | Scale icon |
| Injection | Syringe icon |

---

## Settings Screen

### Sections

1. **Profile** - Name, goal weight, medication, injection day
2. **Account** - Email, password
3. **Notifications** - Reminder preferences
4. **Data** - Export, delete account

### Update Profile

```json
PUT /api/settings/profile
{
  "name": "John Doe",
  "goalWeight": 75,
  "medication": "WEGOVY",
  "injectionDay": 3
}
```

### Change Email

```json
PUT /api/settings/email
{
  "email": "newemail@example.com"
}
```

### Change Password

```json
PUT /api/settings/password
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### Delete Account

```json
DELETE /api/settings/account
{
  "password": "currentpassword"
}
```

Requires password confirmation. Cascades to delete all user data.

---

## Notification Preferences

### Get Preferences

```
GET /api/notifications/preferences
```

Creates defaults if none exist.

### Update Preferences

```json
PUT /api/notifications/preferences
{
  "injectionReminder": true,
  "weighInReminder": true,
  "habitReminder": false,
  "reminderTime": "09:00",
  "habitReminderTime": "20:00",
  "timezone": "America/New_York"
}
```

### Native Push Notifications

The web app uses email notifications. For native apps:

1. **Add device token endpoint** (backend modification)
2. **Register for push** on app launch
3. **Map preferences** to notification categories:
   - Injection reminders → Critical notifications
   - Weigh-in reminders → Standard notifications
   - Habit reminders → Optional notifications

---

## Error Handling

### Common Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 400 | Validation error | Show field-specific errors |
| 401 | Not authenticated | Redirect to login |
| 404 | Resource not found | Show "not found" message |
| 409 | Conflict (e.g., email exists) | Show specific conflict message |
| 500 | Server error | Show generic error, allow retry |

### Validation Error Response

```json
{
  "error": [
    {
      "code": "too_small",
      "minimum": 2,
      "message": "Name must be at least 2 characters",
      "path": ["name"]
    }
  ]
}
```

Map `path[0]` to the corresponding form field.

---

## Offline Support

### Recommended Approach

1. **Cache on fetch** - Store dashboard, recent entries locally
2. **Queue mutations** - Store pending changes when offline
3. **Sync on reconnect** - Process queue, refresh data
4. **Conflict resolution** - Server wins for concurrent edits

### Cacheable Endpoints

| Endpoint | Cache Duration | Strategy |
|----------|---------------|----------|
| /api/dashboard | 5 minutes | Stale-while-revalidate |
| /api/weigh-ins | 15 minutes | Cache, refresh on mutation |
| /api/injections/status | 5 minutes | Stale-while-revalidate |
| /api/habits/today | 5 minutes | Cache, refresh on mutation |
| /api/calendar/{y}/{m} | 30 minutes | Cache per month |

---

## Testing

### Test Accounts

Set up test accounts in your staging environment:
- New user (no data)
- User with full history
- User mid-journey

### Key Flows to Test

1. Registration → Onboarding → First weigh-in
2. Daily habit check-in cycle
3. Weekly injection logging
4. Weight history pagination
5. Calendar navigation between months
6. Session expiry handling
7. Offline mode → reconnection sync

---

## Performance Tips

1. **Batch requests** where possible (dashboard covers most home screen needs)
2. **Paginate lists** - Never fetch all weigh-ins at once
3. **Cache images** - If you add profile photos later
4. **Debounce inputs** - For weight entry, wait for typing to stop
5. **Optimistic updates** - Update UI before API confirms for habit toggles

---

## Security Checklist

- [ ] Store tokens in secure storage (Keychain/Keystore)
- [ ] Clear tokens on logout
- [ ] Use HTTPS only
- [ ] Validate all user inputs client-side
- [ ] Handle 401 responses consistently
- [ ] Implement certificate pinning (optional, recommended)
- [ ] Don't log sensitive data

---

## Questions?

Coordinate with the web team for:
- API staging environment access
- Test account credentials
- Push notification infrastructure decisions
