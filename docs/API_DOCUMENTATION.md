# Needled API Documentation

Version: 1.7
Base URL: `https://your-domain.com/api`

---

## Overview

Needled is a weight loss journey companion app for people using GLP-1 medications (Ozempic, Wegovy, Mounjaro, Zepbound). The API provides endpoints for:

- **User management** - Registration, authentication, profile settings
- **Weight tracking** - Weekly weigh-ins with history, progress charts, and BMI
- **Injection tracking** - Weekly injection logging with site rotation, dose tracking, and dosage titration
- **Daily habits** - Water, nutrition, and exercise check-ins
- **Dashboard** - Aggregated progress data
- **Calendar** - Monthly and daily activity views
- **Notifications** - Reminder preferences, test emails, push notifications, and unsubscribe
- **Beta testing** - Beta tester signup
- **Contact** - Contact form submission

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

### DosingMode
```typescript
type DosingMode = "STANDARD" | "MICRODOSE"
```

### DoseNumber
```typescript
// Standard pens contain 4 doses, but microdosing allows up to 50 doses per pen
// Golden dose (leftover medication) is dosesPerPen + 1
type DoseNumber = number // 1 to dosesPerPen (+ 1 if golden dose)
```

### BetaPlatform
```typescript
type BetaPlatform = "IOS" | "ANDROID"
```

### ProgressRange
```typescript
// Time range for progress chart data
type ProgressRange = "1M" | "3M" | "6M" | "ALL"
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
  "injectionDay": "number (0-6, required, 0=Monday)",
  "height": "number (cm, 100-250, optional, for BMI calculation)",
  "startingDosage": "number (mg, 0.25-15, optional, starting medication dosage)",
  "dosingMode": "STANDARD | MICRODOSE (optional, defaults to STANDARD)",
  "penStrengthMg": "number (0.5-100, optional, required for MICRODOSE mode)",
  "doseAmountMg": "number (0.1-50, optional, required for MICRODOSE mode)",
  "dosesPerPen": "number (1-50, optional, auto-calculated for microdosers)",
  "tracksGoldenDose": "boolean (optional, defaults to false)",
  "currentDoseInPen": "number (optional, defaults to 1)"
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
  "height": 175,
  "currentDosage": 0.5,
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
  "height": 175,
  "currentDosage": 0.5,
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
  "height": 175,
  "currentDosage": 0.5,
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

### Medications (Authenticated)

#### GET /api/medications
Get medication configuration data. This endpoint provides dosage information and pen strengths for all supported medications, enabling the mobile app to dynamically load this data.

**Data Source:** This configuration is stored in database tables (`MedicationConfig`, `MedicationDosage`, `MedicationPenStrength`, `MicrodoseAmount`, `SystemConfig`) and can be updated without code deployments. Use the utility app's "Seed medication configuration" option to populate initial data.

**Headers:**
```
Authorization: Bearer <session_token>
```

**Response (200 OK):**
```json
{
  "medications": [
    {
      "code": "OZEMPIC",
      "name": "Ozempic",
      "manufacturer": "Novo Nordisk",
      "dosages": [0.25, 0.5, 1, 2],
      "penStrengths": [2, 4, 8],
      "supportsMicrodosing": true
    },
    {
      "code": "WEGOVY",
      "name": "Wegovy",
      "manufacturer": "Novo Nordisk",
      "dosages": [0.25, 0.5, 1, 1.7, 2.4],
      "penStrengths": [2.4, 4, 6.8, 10, 17],
      "supportsMicrodosing": true
    },
    {
      "code": "MOUNJARO",
      "name": "Mounjaro",
      "manufacturer": "Eli Lilly",
      "dosages": [2.5, 5, 7.5, 10, 12.5, 15],
      "penStrengths": [5, 10, 15, 20, 25, 30],
      "supportsMicrodosing": true
    },
    {
      "code": "ZEPBOUND",
      "name": "Zepbound",
      "manufacturer": "Eli Lilly",
      "dosages": [2.5, 5, 7.5, 10, 12.5, 15],
      "penStrengths": [5, 10, 15, 20, 25, 30],
      "supportsMicrodosing": true
    },
    {
      "code": "OTHER",
      "name": "Other",
      "manufacturer": null,
      "dosages": [],
      "penStrengths": [],
      "supportsMicrodosing": false
    }
  ],
  "microdoseAmounts": [0.25, 0.5, 1, 1.25, 1.5, 2, 2.5, 3, 3.75, 5, 6.25, 7.5],
  "defaultDosesPerPen": 4
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `medications` | `MedicationConfig[]` | Array of medication configurations |
| `microdoseAmounts` | `number[]` | Common microdose amounts in mg (shared across all medications) |
| `defaultDosesPerPen` | `number` | Default number of doses per pen for standard dosing mode |

**MedicationConfig Object:**

| Field | Type | Description |
|-------|------|-------------|
| `code` | `string` | Unique medication identifier (e.g., "OZEMPIC", "WEGOVY") |
| `name` | `string` | Display name for the medication |
| `manufacturer` | `string \| null` | Manufacturer name, null for "Other" |
| `dosages` | `number[]` | Available standard dosage levels in mg |
| `penStrengths` | `number[]` | Available pen strengths (total mg per pen) |
| `supportsMicrodosing` | `boolean` | Whether this medication supports microdosing mode |

**Caching:**

The response includes cache headers allowing clients to cache for 24 hours:
```
Cache-Control: max-age=86400
```

**Errors:**
- `401` - Unauthorized
- `500` - Failed to fetch medication configuration

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
  "height": 175,
  "currentDosage": 0.5,
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
  "injectionDay": 2,
  "height": 175,
  "currentDosage": 0.5
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
  "injectionDay": "number (0-6, required)",
  "height": "number (cm, 100-250, optional, nullable)",
  "currentDosage": "number (mg, optional, nullable)"
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
  "injectionDay": 3,
  "height": 175,
  "currentDosage": 1.0
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

#### GET /api/settings/pen-dosing
Get pen dosing settings for microdosing and golden dose tracking.

**Response (200 OK):**
```json
{
  "dosingMode": "standard | microdose",
  "penStrengthMg": 15,
  "doseAmountMg": 2.5,
  "dosesPerPen": 6,
  "tracksGoldenDose": true,
  "currentDoseInPen": 3
}
```

**Fields:**
- `dosingMode` - Standard (fixed 4 doses) or microdose (custom dose amounts)
- `penStrengthMg` - Total medication in pen (mg), null for standard mode
- `doseAmountMg` - Amount per dose (mg), null for standard mode
- `dosesPerPen` - Number of doses per pen (4 for standard, calculated for microdose)
- `tracksGoldenDose` - Whether user tracks golden dose (leftover medication)
- `currentDoseInPen` - Current position in the pen (1 to dosesPerPen)

---

#### PUT /api/settings/pen-dosing
Update pen dosing settings.

**Request Body:**
```json
{
  "dosingMode": "STANDARD | MICRODOSE (optional)",
  "penStrengthMg": "number (0.5-100, optional, required for MICRODOSE)",
  "doseAmountMg": "number (0.1-50, optional, required for MICRODOSE)",
  "dosesPerPen": "number (1-50, optional, auto-calculated for microdose)",
  "tracksGoldenDose": "boolean (optional)",
  "currentDoseInPen": "number (optional, min 1)"
}
```

**Response (200 OK):** Updated pen dosing settings object

**Notes:**
- When switching to MICRODOSE mode, `penStrengthMg` and `doseAmountMg` are required
- `dosesPerPen` is automatically calculated as `floor(penStrengthMg / doseAmountMg)` for microdosers
- If `currentDoseInPen` exceeds the new configuration, it resets to 1

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

### Weigh-ins (Authenticated)

All weigh-in endpoints require authentication.

#### GET /api/weigh-ins
Get weigh-in history.

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
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

#### GET /api/weigh-ins/progress
Get weight progress data for charts, including dosage correlation. Requires authentication.

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| range | string | No | ALL | Time range: 1M, 3M, 6M, or ALL |

**Response (200 OK):**
```json
{
  "weighIns": [
    {
      "date": "2024-01-15",
      "weight": 98.5,
      "dosageMg": 0.5
    },
    {
      "date": "2024-01-22",
      "weight": 97.8,
      "dosageMg": 0.5
    }
  ],
  "dosageChanges": [
    {
      "date": "2024-01-01",
      "fromDosage": null,
      "toDosage": 0.25
    },
    {
      "date": "2024-01-15",
      "fromDosage": 0.25,
      "toDosage": 0.5
    }
  ],
  "stats": {
    "totalChange": -2.5,
    "percentChange": -2.5,
    "currentBmi": 24.5,
    "goalProgress": 12.5,
    "toGoal": 17.8,
    "weeklyAverage": -0.35
  }
}
```

**Fields:**
- `weighIns` - Array of weigh-ins with the medication dosage active at that time
- `dosageChanges` - Array of dosage changes showing when medication was titrated
- `stats.totalChange` - Weight change over the period (negative = loss)
- `stats.percentChange` - Percentage body weight change
- `stats.currentBmi` - Current BMI (null if height not set)
- `stats.goalProgress` - Percentage progress toward goal (null if no goal)
- `stats.toGoal` - Weight remaining to reach goal (null if no goal)
- `stats.weeklyAverage` - Average weekly weight change (null if < 7 days of data)

**Errors:**
- `400` - Invalid range parameter
- `401` - Not authenticated
- `404` - User not found

---

#### PATCH /api/weigh-ins/{id}
Update a weigh-in.

**Request Body:**
```json
{
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

**Response (204 No Content)**

---

### Injections (Authenticated)

All injection endpoints require authentication.

#### GET /api/injections
Get injection history.

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
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
    "dosageMg": 0.5,
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
  "site": "ABDOMEN_LEFT | ABDOMEN_RIGHT | THIGH_LEFT | THIGH_RIGHT | UPPER_ARM_LEFT | UPPER_ARM_RIGHT (required)",
  "doseNumber": "number (optional, auto-calculated if omitted)",
  "dosageMg": "number (mg, 0.25-15, optional, medication dosage for this injection)",
  "isGoldenDose": "boolean (optional, defaults to false)",
  "notes": "string (max 500 chars, optional)",
  "date": "string (YYYY-MM-DD, optional, defaults to today)"
}
```

**Golden Dose Notes:**
- Set `isGoldenDose: true` to log a golden dose (leftover medication extraction)
- User must have `tracksGoldenDose` enabled
- All standard doses must be taken first (golden dose is only available after last standard dose)
- After a golden dose, the next injection starts a new pen (dose 1)

**Response (201 Created):**
```json
{
  "id": "cuid",
  "userId": "cuid",
  "date": "2024-01-15T12:00:00.000Z",
  "site": "ABDOMEN_LEFT",
  "doseNumber": 2,
  "dosageMg": 0.5,
  "isGoldenDose": false,
  "notes": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Errors:**
- `400` - Golden dose tracking not enabled for user
- `400` - Golden dose not available (standard doses not completed)

---

#### GET /api/injections/status
Get current injection status with recommendations.

**Response (200 OK):**
```json
{
  "status": "due | done | overdue | upcoming",
  "daysUntil": 6,
  "daysOverdue": 0,
  "lastInjection": {
    "id": "cuid",
    "site": "ABDOMEN_LEFT",
    "doseNumber": 2,
    "dosageMg": 0.5,
    "date": "2024-01-08T12:00:00.000Z",
    "notes": null,
    "isGoldenDose": false
  },
  "suggestedSite": "ABDOMEN_RIGHT",
  "currentDose": 2,
  "nextDose": 3,
  "dosesRemaining": 2,
  "currentDosageMg": 0.5,
  "dosesPerPen": 4,
  "tracksGoldenDose": false,
  "isGoldenDoseAvailable": false,
  "isOnGoldenDose": false
}
```

**Status Logic:**
- `due` - Today is injection day and not yet logged
- `done` - Injection logged for current injection week
- `overdue` - Past injection day with existing injection history, not yet logged this week. **Note:** New users without any injection history cannot be overdue.
- `upcoming` - Before injection day in current week, or new user (no injection history) regardless of day

**Days Until/Overdue:**
- `daysUntil` - Days until next injection:
  - Positive when `status` is `upcoming` (e.g., 6 = 6 days until injection day)
  - Zero when `status` is `due` or `done`
  - **Negative when `status` is `overdue`** (e.g., -1 = 1 day past injection day)
- `daysOverdue` - Days past injection day when overdue (0 otherwise)

**Dose Tracking:**
- `currentDose` - Last injection's dose number (null if no history)
- `nextDose` - Next dose to take:
  - For new users: uses `currentDoseInPen` from registration
  - For existing users: calculated from last injection (wraps around after last dose)
- `dosesRemaining` - **Standard doses remaining in current pen** (does NOT include golden dose). Formula: `dosesPerPen - nextDose + 1`
- `dosesPerPen` - User's configured standard doses per pen
- `tracksGoldenDose` - Whether user tracks golden dose (leftover medication)
- `isGoldenDoseAvailable` - True when all standard doses taken and golden dose can be logged
- `isOnGoldenDose` - True if at golden dose position (either last injection was golden, or new user registered at golden dose position)

**New User Behavior:**
When a user has no injection history (just registered):
- Status will be `due` (if today is their injection day) or `upcoming` (otherwise)
- `currentDose` will be `null`
- `nextDose` will be their `currentDoseInPen` value from registration
- `dosesRemaining` is calculated from their `currentDoseInPen`

---

#### PATCH /api/injections/{id}
Update an injection.

**Request Body:**
```json
{
  "site": "InjectionSite (optional)",
  "doseNumber": "number (1-51, optional)",
  "dosageMg": "number (mg, 0.25-15, optional, nullable)",
  "isGoldenDose": "boolean (optional)",
  "notes": "string (max 500 chars, optional)",
  "date": "string (YYYY-MM-DD, optional)"
}
```

**Response (200 OK):** Updated injection object

---

#### DELETE /api/injections/{id}
Delete an injection.

**Response (204 No Content)**

---

### Daily Habits (Authenticated)

All habit endpoints require authentication.

#### GET /api/habits
Get habit history.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
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

### Dashboard (Authenticated)

#### GET /api/dashboard
Get aggregated dashboard data.

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
    "height": 175,
    "currentDosage": 0.5,
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

### Calendar (Authenticated)

All calendar endpoints require authentication.

#### GET /api/calendar/{year}/{month}
Get all activity data for a month.

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| year | number | 4-digit year (e.g., 2024) |
| month | number | Month 1-12 |

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

#### POST /api/notifications/test
Send a test notification email to the authenticated user. Requires authentication.

**Request Body:**
```json
{
  "type": "injection | weigh-in | habit (required)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Test injection email sent to john@example.com"
}
```

**Errors:**
- `400` - Invalid type / Email address required
- `401` - Not authenticated
- `500` - Failed to send test email

---

#### POST /api/notifications/test-push
Send a test push notification to the authenticated user's registered device. Requires authentication and a registered push token.

**Request Body:**
```json
{
  "type": "injection | weighIn | habit | test (optional, defaults to test)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Test push notification sent to your ios"
}
```

**Errors:**
- `400` - No push token registered
- `401` - Not authenticated
- `500` - Failed to send test push notification

---

### Push Token Management (Authenticated)

#### POST /api/users/push-token
Register or update the user's Expo push token. Called when the mobile app obtains a push token.

**Request Body:**
```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx] (required)",
  "platform": "ios | android (required)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Push token registered successfully"
}
```

**Errors:**
- `400` - Invalid push token format / Invalid platform
- `401` - Not authenticated

---

#### DELETE /api/users/push-token
Remove the user's push token. Should be called on logout to stop sending push notifications to the logged-out device.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Push token removed successfully"
}
```

**Errors:**
- `401` - Not authenticated

---

#### GET /api/notifications/unsubscribe
Unsubscribe from all email notifications using a signed token. This endpoint is used via email links.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Signed unsubscribe token |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "You have been unsubscribed from all Needled email notifications."
}
```

**Errors:**
- `400` - Token is required / Invalid or expired token

---

### Beta Testers (Public)

#### POST /api/beta-testers
Sign up for the beta testing program.

**Request Body:**
```json
{
  "email": "string (valid email, required)",
  "platform": "IOS | ANDROID (required)"
}
```

**Response (201 Created):**
```json
{
  "id": "cuid",
  "email": "john@example.com",
  "platform": "IOS",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Response (200 OK) - Already signed up:**
```json
{
  "message": "You are already signed up for the beta program!"
}
```

**Notes:**
- If the email already exists with a different platform, the platform is updated
- Emails are stored lowercase

**Errors:**
- `400` - Validation error

---

### Contact (Public)

#### POST /api/contact
Submit a contact form message.

**Request Body:**
```json
{
  "name": "string (1-100 chars, required)",
  "email": "string (valid email, required)",
  "message": "string (10-2000 chars, required)"
}
```

**Response (201 Created):**
```json
{
  "id": "cuid",
  "message": "Message sent successfully"
}
```

**Errors:**
- `400` - Validation error

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

**Note:** All authenticated endpoints derive the user from the session token. Do not include `userId` in query parameters or request bodies - it will be ignored.

### 4. Date Handling

- All dates in responses are ISO 8601 format (UTC)
- Date-only fields (e.g., `date` in requests) use `YYYY-MM-DD` format
- The API stores weigh-in and injection dates at noon UTC to avoid timezone issues

### 5. Pagination

For list endpoints, use `limit` and `offset` query parameters:
```
GET /api/weigh-ins?limit=20&offset=0
```

### 6. Offline Support

Consider implementing:
- Local caching of user profile and recent data
- Queued mutations when offline
- Sync on reconnection

### 7. Push Notifications

Push notifications are implemented via **Expo Push Notifications** which provides a unified interface to APNs (iOS) and FCM (Android):

1. **Register token**: Call `POST /api/users/push-token` with the Expo push token obtained from the mobile app
2. **Notifications sent**: The cron job sends push notifications alongside emails for injection, weigh-in, and habit reminders
3. **Test push**: Call `POST /api/notifications/test-push` to verify push notifications work
4. **Logout**: Call `DELETE /api/users/push-token` on logout to stop notifications to the device

**Android Notification Channels:**
| Channel ID | Name | Importance |
|------------|------|------------|
| `default` | Default | HIGH |
| `injection-reminders` | Injection Reminders | HIGH |
| `weighin-reminders` | Weigh-in Reminders | DEFAULT |
| `habit-reminders` | Daily Habit Reminders | DEFAULT |

---

### Cron Jobs (Internal)

These endpoints are for infrastructure automation and require a server-side secret.

#### GET /api/cron/notifications
Trigger all scheduled notification reminders (injection, weigh-in, and habit). This endpoint is designed to be called by a cron scheduler (e.g., Vercel Cron, AWS EventBridge).

**Authentication:**
```
Authorization: Bearer <CRON_SECRET>
```

The `CRON_SECRET` is a server-side environment variable, not a user session token.

**Response (200 OK):**
```json
{
  "success": true,
  "totalEmailsSent": 5,
  "totalPushSent": 3,
  "breakdown": {
    "injectionReminders": { "emailsSent": 2, "pushSent": 1 },
    "weighInReminders": { "emailsSent": 2, "pushSent": 1 },
    "habitReminders": { "emailsSent": 1, "pushSent": 1 }
  }
}
```

**Response with partial failures:**
```json
{
  "success": true,
  "totalEmailsSent": 3,
  "totalPushSent": 2,
  "breakdown": {
    "injectionReminders": { "emailsSent": 2, "pushSent": 1 },
    "weighInReminders": { "emailsSent": 1, "pushSent": 1 },
    "habitReminders": { "emailsSent": 0, "pushSent": 0 }
  },
  "errors": ["Habit reminders failed: SendGrid API error"]
}
```

**Errors:**
- `401` - Unauthorized (missing or invalid CRON_SECRET)
- `500` - Server configuration error (CRON_SECRET not set)

**Cron Schedule Recommendation:**
Run this endpoint every hour. The notification service internally checks each user's preferred reminder time and timezone to determine who should receive notifications.

```yaml
# Example Vercel cron configuration (vercel.json)
{
  "crons": [{
    "path": "/api/cron/notifications",
    "schedule": "0 * * * *"
  }]
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider implementing on your infrastructure:
- 100 requests/minute for authenticated users
- 10 requests/minute for login/register endpoints

---

## Changelog

### v1.7
- Added `GET /api/medications` - Medication configuration endpoint for mobile apps
  - Returns dosages, pen strengths, and microdosing support for all medications
  - Includes common microdose amounts and default doses per pen
  - Response cacheable for 24 hours (Cache-Control: max-age=86400)

### v1.6
- **BUGFIX:** Fixed `GET /api/injections/status` for new users (no injection history)
  - New users now correctly show `status: "upcoming"` instead of `"overdue"` when past their injection day
  - `daysUntil` now shows correct days until next injection day for new users
  - `nextDose` now uses `currentDoseInPen` from registration for new users
  - `dosesRemaining` now correctly calculates only standard doses (excludes golden dose): `dosesPerPen - nextDose + 1`
  - `daysUntil` is now negative when `status` is `"overdue"` (e.g., -1 means 1 day overdue)
  - `isGoldenDoseAvailable` and `isOnGoldenDose` now correctly detect new users at golden dose position

### v1.5
- **BREAKING:** All authenticated endpoints now use Bearer token authentication exclusively
- Removed `userId` from all query parameters and request bodies for authenticated endpoints
- User ID is now derived from the authenticated session for all operations
- Renamed `currentDosage` to `startingDosage` in `POST /api/users` request body
- Added `isGoldenDose` optional field to `PATCH /api/injections/{id}`
- Updated `doseNumber` range from 1-4 to 1-51 to support microdosing

### v1.4
- Added microdosing support with flexible pen sizes
- Added golden dose tracking (leftover medication extraction)
- Added `DosingMode` enum (STANDARD | MICRODOSE)
- Added `GET /api/settings/pen-dosing` - Get pen dosing settings
- Added `PUT /api/settings/pen-dosing` - Update pen dosing settings
- Added User fields: `dosingMode`, `penStrengthMg`, `doseAmountMg`, `dosesPerPen`, `tracksGoldenDose`, `currentDoseInPen`
- Added `isGoldenDose` field to Injection model
- Updated `POST /api/users` - Accept pen dosing fields during registration
- Updated `POST /api/injections` - Accept `isGoldenDose` parameter for golden dose logging
- Updated `GET /api/injections/status` - Added `dosesPerPen`, `tracksGoldenDose`, `isGoldenDoseAvailable`, `isOnGoldenDose`, `lastInjection.isGoldenDose`
- Updated `DoseNumber` type - No longer fixed 1-4, now dynamic based on pen configuration

### v1.3
- Added documentation for `GET /api/cron/notifications` - Cron job endpoint for scheduled reminders
- Added Cron Jobs (Internal) section for infrastructure endpoints

### v1.2
- Added `POST /api/users/push-token` - Register Expo push notification token
- Added `DELETE /api/users/push-token` - Remove push token on logout
- Added `POST /api/notifications/test-push` - Send test push notification
- Added push notification support to cron job (sends both email and push)
- Added `expoPushToken`, `pushTokenPlatform`, `pushTokenUpdatedAt` fields to User

### v1.1
- Added `GET /api/weigh-ins/progress` - Weight progress chart data with BMI and dosage correlation
- Added `POST /api/notifications/test` - Send test notification emails
- Added `GET /api/notifications/unsubscribe` - Token-based email unsubscription
- Added `POST /api/beta-testers` - Beta tester signup
- Added `POST /api/contact` - Contact form submission
- Added `height` field to User (for BMI calculation)
- Added `currentDosage` field to User (current medication dosage)
- Added `dosageMg` field to Injection (dosage at time of injection)
- Added `BetaPlatform` and `ProgressRange` enums

### v1.0 (Initial Release)
- User registration and authentication
- Weight tracking with history
- Injection tracking with site rotation and dose tracking
- Daily habit check-ins
- Dashboard aggregation
- Calendar views
- Notification preferences
- Profile settings and account management
