# Microdosing & Flexible Pen Tracking - API Requirements

This document outlines the API changes required to support the new microdosing and flexible pen tracking features in the Needled mobile app.

## Overview

The mobile app has been updated to support:
1. **Standard dosing mode** - Traditional 4-dose pens
2. **Microdosing mode** - Custom dose amounts from larger pens
3. **Golden dose tracking** - Extracting leftover medication after standard doses
4. **Flexible pen position** - Users can start from any dose position

---

## Data Model Changes

### User Model - New Fields

Add the following fields to the User model:

```typescript
interface User {
  // ... existing fields ...

  // Pen & Dosing Settings (NEW)
  dosingMode: 'standard' | 'microdose';  // Required, default: 'standard'
  penStrengthMg: number | null;           // For microdosers: total mg in pen
  doseAmountMg: number | null;            // For microdosers: amount per injection
  dosesPerPen: number;                    // Calculated or default 4
  tracksGoldenDose: boolean;              // Default: false
  currentDoseInPen: number;               // 1-based, default: 1
}
```

#### Field Descriptions

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `dosingMode` | enum | Yes | `'standard'` | Whether user takes standard doses or microdoses |
| `penStrengthMg` | number | No | null | Total mg in the pen (only for microdosers) |
| `doseAmountMg` | number | No | null | Amount per injection (only for microdosers) |
| `dosesPerPen` | number | Yes | 4 | Number of standard doses per pen |
| `tracksGoldenDose` | boolean | Yes | false | Whether user extracts golden dose |
| `currentDoseInPen` | number | Yes | 1 | Current position in pen (1-based) |

### Injection Model - New Field

Add the following field to the Injection model:

```typescript
interface Injection {
  // ... existing fields ...

  isGoldenDose: boolean;  // NEW - Default: false
}
```

---

## API Endpoint Changes

### 1. Registration Endpoint

**Endpoint:** `POST /api/auth/register`

**Updated Request Body:**

```typescript
interface RegisterRequest {
  // ... existing fields ...

  // Pen & Dosing Settings (all optional, use defaults if not provided)
  dosingMode?: 'standard' | 'microdose';  // Default: 'standard'
  penStrengthMg?: number;                  // For microdosers
  doseAmountMg?: number;                   // For microdosers
  dosesPerPen?: number;                    // Calculated or default 4
  tracksGoldenDose?: boolean;              // Default: false
  currentDoseInPen?: number;               // Default: 1
}
```

**Validation Rules:**
- If `dosingMode` is `'microdose'`, `penStrengthMg` and `doseAmountMg` are required
- `dosesPerPen` should be calculated as `floor(penStrengthMg / doseAmountMg)` for microdosers
- `currentDoseInPen` must be between 1 and `dosesPerPen` (or `dosesPerPen + 1` if `tracksGoldenDose` is true)

---

### 2. Injection Status Endpoint

**Endpoint:** `GET /api/injections/status`

**Updated Response Body:**

```typescript
interface InjectionStatusResponse {
  // ... existing fields ...

  // Update existing field types
  currentDose: number | null;    // Was: DoseNumber (1-4), now: dynamic
  nextDose: number;              // Was: DoseNumber (1-4), now: dynamic
  dosesRemaining: number;        // Unchanged, but now uses dosesPerPen

  // Update lastInjection type
  lastInjection: {
    id: string;
    site: InjectionSite;
    doseNumber: number;          // Was: DoseNumber, now: number
    dosageMg: number | null;
    isGoldenDose: boolean;       // NEW
    date: string;
    notes: string | null;
  } | null;

  // NEW Fields
  dosesPerPen: number;           // Total doses in pen (4 for standard, variable for micro)
  tracksGoldenDose: boolean;     // Whether golden dose tracking is enabled
  isGoldenDoseAvailable: boolean; // True if all standard doses used but golden not yet taken
  isOnGoldenDose: boolean;       // True if next dose is the golden dose
}
```

**Calculation Logic:**

```typescript
// Calculate isGoldenDoseAvailable
const isGoldenDoseAvailable =
  user.tracksGoldenDose &&
  currentDose >= user.dosesPerPen &&
  !lastInjectionWasGolden;

// Calculate isOnGoldenDose
const isOnGoldenDose =
  user.tracksGoldenDose &&
  nextDose > user.dosesPerPen;

// Calculate nextDose
function calculateNextDose(currentDose, dosesPerPen, tracksGoldenDose, wasGoldenDose) {
  if (wasGoldenDose) {
    return 1; // Start new pen
  }
  if (currentDose >= dosesPerPen) {
    return tracksGoldenDose ? dosesPerPen + 1 : 1;
  }
  return currentDose + 1;
}

// Calculate dosesRemaining
function calculateDosesRemaining(currentDose, dosesPerPen, wasGoldenDose) {
  if (wasGoldenDose || currentDose >= dosesPerPen) {
    return dosesPerPen; // New pen
  }
  return dosesPerPen - currentDose;
}
```

---

### 3. Log Injection Endpoint

**Endpoint:** `POST /api/injections`

**Updated Request Body:**

```typescript
interface CreateInjectionRequest {
  userId: string;
  site: InjectionSite;
  doseNumber?: number;           // Was: DoseNumber, now: number (optional)
  dosageMg?: number;
  isGoldenDose?: boolean;        // NEW - Default: false
  notes?: string;
  date?: string;
}
```

**Server Logic:**
1. If `isGoldenDose` is true, validate that all standard doses have been taken
2. Update user's `currentDoseInPen` after logging
3. If this completes the pen (golden dose or last standard dose without golden tracking), reset `currentDoseInPen` to 1

---

### 4. New Endpoint: Get Pen & Dosing Settings

**Endpoint:** `GET /api/settings/pen-dosing`

**Response Body:**

```typescript
interface PenDosingSettings {
  dosingMode: 'standard' | 'microdose';
  penStrengthMg: number | null;
  doseAmountMg: number | null;
  dosesPerPen: number;
  tracksGoldenDose: boolean;
  currentDoseInPen: number;
}
```

---

### 5. New Endpoint: Update Pen & Dosing Settings

**Endpoint:** `PUT /api/settings/pen-dosing`

**Request Body:**

```typescript
interface UpdatePenDosingRequest {
  dosingMode: 'standard' | 'microdose';
  penStrengthMg?: number | null;   // Required if microdose
  doseAmountMg?: number | null;    // Required if microdose
  dosesPerPen?: number;            // Will be calculated if not provided
  tracksGoldenDose: boolean;
  currentDoseInPen: number;
}
```

**Response Body:** `PenDosingSettings` (same as GET)

**Validation Rules:**
- If `dosingMode` is `'microdose'`, `penStrengthMg` and `doseAmountMg` are required
- `dosesPerPen` for microdosers should be calculated as `floor(penStrengthMg / doseAmountMg)`
- `currentDoseInPen` must be valid for the new settings

---

## Database Migration

### Migration Script Pseudocode

```sql
-- Add new columns to users table
ALTER TABLE users ADD COLUMN dosing_mode VARCHAR(20) DEFAULT 'standard';
ALTER TABLE users ADD COLUMN pen_strength_mg DECIMAL(10,2) NULL;
ALTER TABLE users ADD COLUMN dose_amount_mg DECIMAL(10,2) NULL;
ALTER TABLE users ADD COLUMN doses_per_pen INTEGER DEFAULT 4;
ALTER TABLE users ADD COLUMN tracks_golden_dose BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN current_dose_in_pen INTEGER DEFAULT 1;

-- Add new column to injections table
ALTER TABLE injections ADD COLUMN is_golden_dose BOOLEAN DEFAULT false;

-- Set current_dose_in_pen for existing users based on their injection history
-- (This requires custom logic based on existing injection counts)
```

### Migration Considerations

1. **Existing Users:** Default to `dosingMode: 'standard'`, `dosesPerPen: 4`, `tracksGoldenDose: false`
2. **Current Dose Calculation:** For existing users, calculate `currentDoseInPen` from their injection history:
   ```
   currentDoseInPen = (totalInjections % 4) + 1
   ```
   Or use the `nextDose` value from their current injection status

---

## Type Changes Summary

### `DoseNumber` Type

**Before:**
```typescript
type DoseNumber = 1 | 2 | 3 | 4;
```

**After:**
```typescript
type DoseNumber = number;  // 1 through dosesPerPen (+ 1 if golden)
```

The mobile app has been updated to handle dynamic `DoseNumber` values. The API should:
- Accept any positive integer for `doseNumber`
- Validate that `doseNumber` is within valid range for the user's settings
- Return `number` type (not restricted to 1-4)

---

## Backward Compatibility

The mobile app has been designed with backward compatibility in mind:

1. **Default Values:** All new fields have sensible defaults
2. **Optional Response Fields:** New response fields (`dosesPerPen`, `tracksGoldenDose`, etc.) are optional in the mobile app - it falls back to defaults if not present
3. **Gradual Rollout:** The API can be updated incrementally

### Recommended Rollout Order

1. **Phase 1:** Add database columns with defaults (no API changes yet)
2. **Phase 2:** Add new fields to registration endpoint (optional)
3. **Phase 3:** Add new fields to injection status response
4. **Phase 4:** Add new pen-dosing settings endpoints
5. **Phase 5:** Add `isGoldenDose` to injection creation

---

## API Response Examples

### Injection Status - Standard User

```json
{
  "status": "upcoming",
  "daysUntil": 3,
  "daysOverdue": 0,
  "lastInjection": {
    "id": "abc123",
    "site": "ABDOMEN_LEFT",
    "doseNumber": 2,
    "dosageMg": 1.0,
    "isGoldenDose": false,
    "date": "2026-01-28T10:00:00Z",
    "notes": null
  },
  "suggestedSite": "ABDOMEN_RIGHT",
  "currentDose": 2,
  "nextDose": 3,
  "dosesRemaining": 2,
  "currentDosageMg": 1.0,
  "dosesPerPen": 4,
  "tracksGoldenDose": false,
  "isGoldenDoseAvailable": false,
  "isOnGoldenDose": false
}
```

### Injection Status - Microdoser with Golden Dose

```json
{
  "status": "due",
  "daysUntil": 0,
  "daysOverdue": 0,
  "lastInjection": {
    "id": "def456",
    "site": "THIGH_LEFT",
    "doseNumber": 6,
    "dosageMg": 2.5,
    "isGoldenDose": false,
    "date": "2026-01-21T10:00:00Z",
    "notes": "Last standard dose"
  },
  "suggestedSite": "THIGH_RIGHT",
  "currentDose": 6,
  "nextDose": 7,
  "dosesRemaining": 0,
  "currentDosageMg": 2.5,
  "dosesPerPen": 6,
  "tracksGoldenDose": true,
  "isGoldenDoseAvailable": true,
  "isOnGoldenDose": true
}
```

### Injection Status - After Golden Dose (New Pen)

```json
{
  "status": "done",
  "daysUntil": 7,
  "daysOverdue": 0,
  "lastInjection": {
    "id": "ghi789",
    "site": "THIGH_RIGHT",
    "doseNumber": 7,
    "dosageMg": null,
    "isGoldenDose": true,
    "date": "2026-01-28T10:00:00Z",
    "notes": "Golden dose!"
  },
  "suggestedSite": "ABDOMEN_LEFT",
  "currentDose": null,
  "nextDose": 1,
  "dosesRemaining": 6,
  "currentDosageMg": 2.5,
  "dosesPerPen": 6,
  "tracksGoldenDose": true,
  "isGoldenDoseAvailable": false,
  "isOnGoldenDose": false
}
```

---

## Testing Checklist

### Unit Tests
- [ ] Registration with standard dosing mode
- [ ] Registration with microdosing mode
- [ ] Calculate dosesPerPen from pen strength and dose amount
- [ ] Validate currentDoseInPen range
- [ ] Calculate next dose (standard user)
- [ ] Calculate next dose (microdoser)
- [ ] Calculate next dose (golden dose scenario)
- [ ] Golden dose availability logic

### Integration Tests
- [ ] Full injection cycle - standard user (4 doses)
- [ ] Full injection cycle - microdoser (variable doses)
- [ ] Golden dose extraction flow
- [ ] Pen transition after last dose
- [ ] Update pen dosing settings mid-pen
- [ ] Migration of existing users

---

## Questions for Backend Team

1. **Decimal Precision:** What precision should be used for `penStrengthMg` and `doseAmountMg`? The mobile app uses 2 decimal places.

2. **Golden Dose Amount:** Should we track the amount of the golden dose? Currently, the mobile app only tracks existence (boolean). If we want to track amount, we'd need additional fields.

3. **Dose Escalation:** When a user increases their dosage mid-pen, should we track this scenario? For v1, the mobile app doesn't handle this edge case.

4. **Audit Trail:** Should changes to pen dosing settings be logged for analytics? (e.g., when a user switches from standard to microdosing)

---

## Mobile App Files Reference

The following mobile app files have been updated and can be used as reference for understanding the expected behavior:

| File | Purpose |
|------|---------|
| `src/types/api.ts` | Type definitions for all new fields |
| `src/constants/dosages.ts` | Helper functions for dose calculations |
| `src/hooks/useInjections.ts` | Optimistic update logic |
| `src/components/onboarding/WizardContainer.tsx` | Onboarding flow orchestration |
| `src/components/onboarding/steps/DosingModeStep.tsx` | Dosing mode selection (standard vs microdose) |
| `src/components/onboarding/steps/MedicationStep.tsx` | Medication selection (adapts to dosing mode) |
| `src/components/onboarding/steps/GoldenDoseStep.tsx` | Golden dose opt-in UI |
| `src/components/onboarding/steps/PenPositionStep.tsx` | Current pen position selection |
| `app/settings/pen-dosing.tsx` | Settings screen for pen configuration |

### Onboarding Flow Order

The onboarding flow collects information in this order:

1. **Name** - User's name
2. **Email** - User's email address
3. **Password** - Account password
4. **Dosing Mode** - Standard or Microdosing (determines subsequent fields)
5. **Medication** - Which GLP-1 medication + injection day + dosing details:
   - Standard mode: current dosage level (e.g., 0.5mg, 1mg)
   - Microdose mode: pen strength (e.g., 10mg) + dose amount per injection (e.g., 2.5mg)
6. **Golden Dose** - Whether user extracts the leftover "golden dose"
7. **Pen Position** - Which dose they're currently on in their pen
8. **Weight** - Starting weight and goal weight
9. **Height** - Height for BMI calculations

---

*Document created: 2026-02-03*
*Document updated: 2026-02-04*
*Mobile app version: Pending release*
