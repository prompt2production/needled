# Needled API Quick Reference

## Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/session` | Get current user |
| POST | `/api/auth/logout` | Logout |

## User Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/{id}` | Get user by ID |
| GET | `/api/settings` | Get profile settings (auth) |
| PUT | `/api/settings/profile` | Update profile (auth) |
| PUT | `/api/settings/email` | Update email (auth) |
| PUT | `/api/settings/password` | Change password (auth) |
| GET | `/api/settings/export` | Export all data (auth) |
| DELETE | `/api/settings/account` | Delete account (auth) |

## Weigh-ins
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weigh-ins?userId=X` | List weigh-ins |
| POST | `/api/weigh-ins` | Create weigh-in |
| GET | `/api/weigh-ins/latest?userId=X` | Get latest with stats |
| PATCH | `/api/weigh-ins/{id}` | Update weigh-in |
| DELETE | `/api/weigh-ins/{id}?userId=X` | Delete weigh-in |

## Injections
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/injections?userId=X` | List injections |
| POST | `/api/injections` | Log injection |
| GET | `/api/injections/status?userId=X` | Get status & suggestions |
| PATCH | `/api/injections/{id}` | Update injection |
| DELETE | `/api/injections/{id}?userId=X` | Delete injection |

## Daily Habits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits?userId=X` | List habits (optional date range) |
| GET | `/api/habits/today?userId=X` | Get today's habits |
| PATCH | `/api/habits/today` | Toggle a habit |

## Dashboard & Calendar
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard?userId=X` | Get dashboard data |
| GET | `/api/calendar/{year}/{month}?userId=X` | Get month data |
| GET | `/api/calendar/day/{date}?userId=X` | Get day detail |

## Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/preferences` | Get preferences (auth) |
| PUT | `/api/notifications/preferences` | Update preferences (auth) |

---

## Enums

**WeightUnit:** `kg` | `lbs`

**Medication:** `OZEMPIC` | `WEGOVY` | `MOUNJARO` | `ZEPBOUND` | `OTHER`

**InjectionSite:** `ABDOMEN_LEFT` | `ABDOMEN_RIGHT` | `THIGH_LEFT` | `THIGH_RIGHT` | `UPPER_ARM_LEFT` | `UPPER_ARM_RIGHT`

**HabitType:** `water` | `nutrition` | `exercise`

**InjectionStatus:** `due` | `done` | `overdue` | `upcoming`

**InjectionDay:** `0` (Mon) - `6` (Sun)

---

## Common Request Bodies

### Register User
```json
{
  "name": "string",
  "email": "string",
  "password": "string (8+ chars)",
  "startWeight": 100,
  "goalWeight": 80,
  "weightUnit": "kg",
  "medication": "OZEMPIC",
  "injectionDay": 2
}
```

### Login
```json
{
  "email": "string",
  "password": "string"
}
```

### Create Weigh-in
```json
{
  "userId": "string",
  "weight": 98.5,
  "date": "2024-01-15"
}
```

### Log Injection
```json
{
  "userId": "string",
  "site": "ABDOMEN_LEFT",
  "doseNumber": 2,
  "notes": "optional"
}
```

### Toggle Habit
```json
{
  "userId": "string",
  "habit": "water",
  "value": true,
  "date": "2024-01-15"
}
```

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (DELETE) |
| 400 | Validation Error |
| 401 | Not Authenticated |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |
