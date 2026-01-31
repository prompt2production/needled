# Backend API Requirements for Dosage Tracking & Weight Progress Chart

## Overview
The mobile app now supports medication dosage (mg) tracking and a weight progress chart. The backend needs updates to store dosage data and provide a new endpoint for chart data.

---

## 1. Database Schema Changes

### Users Table
Add two new columns:
```sql
currentDosage DECIMAL(4,2) NULL  -- Current medication dosage in mg (e.g., 0.25, 2.5, 15)
height INTEGER NULL              -- Height in centimeters (for BMI calculation)
```

### Injections Table
Add one new column:
```sql
dosageMg DECIMAL(4,2) NULL  -- Medication dosage at time of injection
```

---

## 2. Modified Endpoints

### 2.1 POST /api/users (Registration)

**New request fields:**
```typescript
{
  // ...existing fields...
  startingDosage?: number;  // Starting medication dosage in mg
  height?: number;          // Height in cm
}
```

**Behavior:**
- Store `startingDosage` as the user's `currentDosage`
- Store `height` in the users table
- Both fields are optional

---

### 2.2 PUT /api/settings/profile

**New request fields:**
```typescript
{
  // ...existing fields...
  currentDosage?: number | null;  // Update current dosage
  height?: number | null;         // Update height
}
```

---

### 2.3 POST /api/injections

**New request field:**
```typescript
{
  // ...existing fields...
  dosageMg?: number;  // Medication dosage in mg for this injection
}
```

**Behavior:**
- Store `dosageMg` with the injection record
- **Important:** If `dosageMg` differs from the user's `currentDosage`, update the user's `currentDosage` to this new value (this indicates titration)

---

### 2.4 GET /api/injections/status

**New response fields:**
```typescript
{
  // ...existing fields...
  lastInjection: {
    // ...existing fields...
    dosageMg: number | null;  // ADD: Dosage at time of injection
  } | null;
  currentDosageMg: number | null;  // ADD: User's current dosage in mg
}
```

---

### 2.5 GET /api/users/me (if exists) or User object in responses

**New response fields:**
```typescript
{
  // ...existing fields...
  currentDosage: number | null;
  height: number | null;
}
```

---

## 3. New Endpoint

### GET /api/weigh-ins/progress

Returns weight progress data for the chart, including dosage periods.

**Request:**
```
GET /api/weigh-ins/progress?userId={userId}&range={range}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID |
| range | string | No | Time range filter: `1M`, `3M`, `6M`, or `ALL` (default: `ALL`) |

**Range Logic:**
- `1M` = Last 30 days
- `3M` = Last 90 days
- `6M` = Last 180 days
- `ALL` = All time (from user's first weigh-in)

**Response:**
```typescript
{
  weighIns: Array<{
    date: string;           // ISO date string (YYYY-MM-DD)
    weight: number;         // Weight value
    dosageMg: number | null; // User's dosage at this date (see logic below)
  }>;

  dosageChanges: Array<{
    date: string;              // ISO date string when change occurred
    fromDosage: number | null; // Previous dosage (null if first)
    toDosage: number;          // New dosage
  }>;

  stats: {
    totalChange: number;        // Total weight change from first to last weigh-in
    percentChange: number;      // Percentage change from starting weight
    currentBmi: number | null;  // Current BMI (null if no height)
    goalProgress: number | null; // Percentage progress toward goal (null if no goal)
    toGoal: number | null;      // Weight remaining to goal (null if no goal)
    weeklyAverage: number | null; // Average weekly weight change
  };
}
```

**Calculating `dosageMg` for each weigh-in:**

For each weigh-in, determine what dosage the user was on at that date:
1. Find the most recent injection **before or on** the weigh-in date that has a `dosageMg` value
2. Use that injection's `dosageMg` as the weigh-in's dosage
3. If no prior injection with dosage exists, use `null`

**Calculating `dosageChanges`:**

Build a list of dosage transitions from injection records:
1. Query all injections for the user (within the date range) where `dosageMg` is not null
2. Order by date ascending
3. Track when dosage changes from one value to another
4. Record each change with date, fromDosage, and toDosage

**Example dosageChanges logic (pseudocode):**
```python
changes = []
last_dosage = None

for injection in injections_ordered_by_date:
    if injection.dosageMg != last_dosage:
        changes.append({
            date: injection.date,
            fromDosage: last_dosage,
            toDosage: injection.dosageMg
        })
        last_dosage = injection.dosageMg

return changes
```

**Stats Calculations:**

| Stat | Formula |
|------|---------|
| `totalChange` | `lastWeighIn.weight - firstWeighIn.weight` |
| `percentChange` | `((lastWeight - firstWeight) / firstWeight) * 100` |
| `currentBmi` | `weight(kg) / (height(m))²` — convert units as needed; null if no height |
| `goalProgress` | `((startWeight - currentWeight) / (startWeight - goalWeight)) * 100`; null if no goal |
| `toGoal` | `currentWeight - goalWeight`; null if no goal |
| `weeklyAverage` | `totalChange / numberOfWeeks` where weeks = days between first and last weigh-in / 7 |

---

## 4. Medication Dosage Reference

For validation purposes, here are the valid dosages per medication:

| Medication | Valid Dosages (mg) |
|------------|-------------------|
| OZEMPIC | 0.25, 0.5, 1, 2 |
| WEGOVY | 0.25, 0.5, 1, 1.7, 2.4 |
| MOUNJARO | 2.5, 5, 7.5, 10, 12.5, 15 |
| ZEPBOUND | 2.5, 5, 7.5, 10, 12.5, 15 |
| OTHER | No dosage tracking (skip validation) |

**Note:** Users with medication = "OTHER" will not send dosage values. The frontend skips dosage collection for these users.

---

## 5. Example API Response

**GET /api/weigh-ins/progress?userId=123&range=3M**

```json
{
  "weighIns": [
    { "date": "2025-11-01", "weight": 200.0, "dosageMg": 2.5 },
    { "date": "2025-11-08", "weight": 198.5, "dosageMg": 2.5 },
    { "date": "2025-11-15", "weight": 196.2, "dosageMg": 5.0 },
    { "date": "2025-11-22", "weight": 194.8, "dosageMg": 5.0 },
    { "date": "2025-11-29", "weight": 192.1, "dosageMg": 5.0 },
    { "date": "2025-12-06", "weight": 190.5, "dosageMg": 7.5 }
  ],
  "dosageChanges": [
    { "date": "2025-11-01", "fromDosage": null, "toDosage": 2.5 },
    { "date": "2025-11-12", "fromDosage": 2.5, "toDosage": 5.0 },
    { "date": "2025-12-03", "fromDosage": 5.0, "toDosage": 7.5 }
  ],
  "stats": {
    "totalChange": -9.5,
    "percentChange": -4.75,
    "currentBmi": 28.2,
    "goalProgress": 31.7,
    "toGoal": 20.5,
    "weeklyAverage": -1.9
  }
}
```

---

## 6. Summary of Changes

| Endpoint | Change Type | Description |
|----------|-------------|-------------|
| POST /api/users | Modify | Accept `startingDosage`, `height` |
| PUT /api/settings/profile | Modify | Accept `currentDosage`, `height` |
| POST /api/injections | Modify | Accept `dosageMg`; update user's currentDosage on titration |
| GET /api/injections/status | Modify | Return `currentDosageMg` and `dosageMg` in lastInjection |
| GET /api/weigh-ins/progress | **New** | Return chart data with dosage segments and stats |
