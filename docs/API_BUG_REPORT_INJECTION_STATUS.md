# API Bug Report: Injection Status Endpoint

**Date:** 2026-02-06
**Reported By:** Mobile App Team
**Endpoint:** `GET /api/injections/status`
**Priority:** High
**Status:** Open

---

## Summary

The injection status endpoint returns incorrect data for newly registered users who have not yet logged any injections. The endpoint fails to use registration values (`currentDoseInPen`, `injectionDay`) when calculating the response.

---

## Environment

- **Mobile App Version:** Development build
- **Test Scenario:** New user registration with standard dosing mode and golden dose tracking enabled
- **Registration Data Used:**
  - `injectionDay`: 3 (Thursday)
  - `dosingMode`: "STANDARD"
  - `tracksGoldenDose`: true
  - `currentDoseInPen`: 3

---

## Issues

### Issue 1: Days Until Calculation for New Users

**Current Behavior:**
Returns `status: "overdue"` with `daysUntil: 0` for users who just registered and have no injection history.

**Expected Behavior:**
Calculate days until next injection based on user's `injectionDay` setting.

**Example:**
| Condition | Value |
|-----------|-------|
| Today | Friday (day 4, where 0=Monday) |
| User's `injectionDay` | Thursday (3) |
| Next Thursday | 6 days away |
| Expected `status` | `"upcoming"` |
| Expected `daysUntil` | `6` |
| Actual `status` | `"overdue"` |
| Actual `daysUntil` | `0` |

**Recommended Fix:**

```typescript
function calculateDaysUntil(injectionDay: number): { status: InjectionStatus; daysUntil: number } {
  // injectionDay: 0=Monday, 1=Tuesday, ..., 6=Sunday
  const today = new Date();

  // Convert JS day (0=Sunday) to API day (0=Monday)
  const currentDayOfWeek = (today.getDay() + 6) % 7;

  let daysUntil = injectionDay - currentDayOfWeek;

  // If injection day has passed this week, calculate for next week
  if (daysUntil < 0) {
    daysUntil += 7;
  }

  // Determine status
  if (daysUntil === 0) {
    return { status: 'due', daysUntil: 0 };
  }

  return { status: 'upcoming', daysUntil };
}
```

---

### Issue 2: Current Dose Not Using Registration Value

**Current Behavior:**
Returns `currentDose: 1` regardless of user's `currentDoseInPen` setting from registration.

**Expected Behavior:**
For users with no injection history, use `currentDoseInPen` from their user record to determine `nextDose`.

**Example:**
| Field | Expected | Actual (Buggy) |
|-------|----------|----------------|
| `currentDose` | `null` (no injection taken) | `1` |
| `nextDose` | `3` (from registration) | `2` |

**Recommended Fix:**

```typescript
function calculateDoseInfo(user: User, lastInjection: Injection | null) {
  const { dosesPerPen, tracksGoldenDose, currentDoseInPen } = user;

  if (lastInjection) {
    // User has injection history - calculate from last injection
    const currentDose = lastInjection.doseNumber;
    const nextDose = calculateNextDose(
      currentDose,
      dosesPerPen,
      tracksGoldenDose,
      lastInjection.isGoldenDose
    );
    const dosesRemaining = calculateDosesRemaining(nextDose, dosesPerPen);

    return { currentDose, nextDose, dosesRemaining };
  } else {
    // No injection history - use registration values
    return {
      currentDose: null,  // No injection taken yet
      nextDose: currentDoseInPen,  // They're about to take this dose
      dosesRemaining: dosesPerPen - currentDoseInPen + 1
    };
  }
}

function calculateNextDose(
  currentDose: number,
  dosesPerPen: number,
  tracksGoldenDose: boolean,
  wasGoldenDose: boolean
): number {
  // After golden dose, start new pen
  if (wasGoldenDose) {
    return 1;
  }

  // After last standard dose
  if (currentDose >= dosesPerPen) {
    // If tracking golden dose, next is golden (dosesPerPen + 1)
    // Otherwise, start new pen
    return tracksGoldenDose ? dosesPerPen + 1 : 1;
  }

  // Normal case: next dose in sequence
  return currentDose + 1;
}
```

---

### Issue 3: Doses Remaining Calculation

**Current Behavior:**
Returns inconsistent `dosesRemaining` value (showing `5` in test case).

**Expected Behavior:**
Calculate remaining standard doses in the current pen.

**Example:**
| Condition | Value |
|-----------|-------|
| `dosesPerPen` | 4 |
| `nextDose` | 3 |
| `tracksGoldenDose` | true |
| Expected `dosesRemaining` | 2 (doses 3 and 4 remaining) |
| Actual `dosesRemaining` | 5 |

**Recommended Fix:**

```typescript
function calculateDosesRemaining(nextDose: number, dosesPerPen: number): number {
  // Remaining standard doses (not including golden)
  // If nextDose is 3 and dosesPerPen is 4, remaining = 4 - 3 + 1 = 2
  return Math.max(0, dosesPerPen - nextDose + 1);
}
```

**Note:** The golden dose indicator (`+ ✨`) is handled by the mobile app based on the `tracksGoldenDose` boolean flag. The `dosesRemaining` field only counts standard doses.

---

## Summary of Expected vs Actual

| Field | Expected | Actual (Buggy) | Notes |
|-------|----------|----------------|-------|
| `status` | `"upcoming"` | `"overdue"` | Calculate from `injectionDay` |
| `daysUntil` | `6` | `0` | Days until next injection day |
| `daysOverdue` | `0` | `0` | Correct |
| `currentDose` | `null` | `1` | No injection logged yet |
| `nextDose` | `3` | `2` | Use `user.currentDoseInPen` |
| `dosesRemaining` | `2` | `5` | `dosesPerPen - nextDose + 1` |
| `dosesPerPen` | `4` | `4` | Correct |
| `tracksGoldenDose` | `true` | `false` | Should use user's setting |
| `isGoldenDoseAvailable` | `false` | `false` | Correct |
| `isOnGoldenDose` | `false` | `false` | Correct |

---

## Test Scenario to Verify Fix

### Step 1: Create Test User

```http
POST /api/users
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "startWeight": 200,
  "weightUnit": "lbs",
  "medication": "OZEMPIC",
  "injectionDay": 3,
  "dosingMode": "STANDARD",
  "tracksGoldenDose": true,
  "currentDoseInPen": 3
}
```

### Step 2: Get Injection Status

```http
GET /api/injections/status
Authorization: Bearer <session_token>
```

### Step 3: Verify Response

**Expected Response (when tested on a Friday):**

```json
{
  "status": "upcoming",
  "daysUntil": 6,
  "daysOverdue": 0,
  "lastInjection": null,
  "suggestedSite": "ABDOMEN_LEFT",
  "currentDose": null,
  "nextDose": 3,
  "dosesRemaining": 2,
  "currentDosageMg": null,
  "dosesPerPen": 4,
  "tracksGoldenDose": true,
  "isGoldenDoseAvailable": false,
  "isOnGoldenDose": false
}
```

---

## Additional Test Cases

### Test Case 2: User on Golden Dose

**Setup:**
- `dosesPerPen`: 4
- `currentDoseInPen`: 5 (golden dose position)
- `tracksGoldenDose`: true

**Expected Response:**
```json
{
  "currentDose": null,
  "nextDose": 5,
  "dosesRemaining": 0,
  "isGoldenDoseAvailable": true,
  "isOnGoldenDose": true
}
```

### Test Case 3: Microdoser

**Setup:**
- `dosingMode`: "MICRODOSE"
- `penStrengthMg`: 15
- `doseAmountMg`: 2.5
- `dosesPerPen`: 6 (calculated: floor(15 / 2.5))
- `currentDoseInPen`: 4
- `tracksGoldenDose`: true

**Expected Response:**
```json
{
  "currentDose": null,
  "nextDose": 4,
  "dosesRemaining": 3,
  "dosesPerPen": 6,
  "tracksGoldenDose": true,
  "isGoldenDoseAvailable": false,
  "isOnGoldenDose": false
}
```

### Test Case 4: Injection Day is Today

**Setup:**
- Today is Thursday
- `injectionDay`: 3 (Thursday)
- No injection history

**Expected Response:**
```json
{
  "status": "due",
  "daysUntil": 0,
  "daysOverdue": 0
}
```

### Test Case 5: Injection Day was Yesterday (Overdue)

**Setup:**
- Today is Friday
- `injectionDay`: 3 (Thursday)
- Last injection was 2 weeks ago

**Expected Response:**
```json
{
  "status": "overdue",
  "daysUntil": -1,
  "daysOverdue": 1
}
```

---

## Screenshots

### Current (Buggy) Display

The dashboard shows:
- "0 day overdue" (should show "6 days until Thursday")
- "Dose 1/4" (should show "Dose 3/4+✨" or indicate next dose is 3)
- "5 doses left" (should show "2 doses left + ✨")

---

## References

- [API Documentation](./API_DOCUMENTATION.md) - See `GET /api/injections/status`
- [Microdosing API Requirements](./MICRODOSING_API_REQUIREMENTS.md) - Full spec for pen tracking features

---

## Contact

For questions about the mobile app's expectations, contact the mobile development team.
