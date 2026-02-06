# Medication Configuration API

## Overview

This document specifies the API endpoint for retrieving medication configuration data. This enables the mobile app to dynamically load medication dosages and pen strengths from the backend, allowing updates without app releases.

## Endpoint

```
GET /api/medications
```

### Authentication
- Required: Yes (Bearer token)

### Response

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

### Response Fields

#### Root Object

| Field | Type | Description |
|-------|------|-------------|
| `medications` | `MedicationConfig[]` | Array of medication configurations |
| `microdoseAmounts` | `number[]` | Common microdose amounts in mg (shared across all medications) |
| `defaultDosesPerPen` | `number` | Default number of doses per pen for standard dosing mode |

#### MedicationConfig Object

| Field | Type | Description |
|-------|------|-------------|
| `code` | `string` | Unique medication identifier (e.g., "OZEMPIC", "WEGOVY") |
| `name` | `string` | Display name for the medication |
| `manufacturer` | `string \| null` | Manufacturer name, null for "Other" |
| `dosages` | `number[]` | Available standard dosage levels in mg |
| `penStrengths` | `number[]` | Available pen strengths (total mg per pen) |
| `supportsMicrodosing` | `boolean` | Whether this medication supports microdosing mode |

### Caching

The response should include appropriate cache headers since this data changes infrequently:

```
Cache-Control: max-age=86400
```

This allows clients to cache the response for 24 hours.

### Error Responses

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to fetch medication configuration"
}
```

## Implementation Notes

### Adding New Medications

To add a new medication:
1. Add a new entry to the `medications` array with all required fields
2. Ensure the `code` is unique and uppercase
3. The mobile app will automatically pick up the new medication on next fetch

### Updating Dosages or Pen Strengths

Simply update the corresponding arrays in the medication config. Changes will be reflected in the app within 24 hours (or immediately on fresh app load).

### Mobile App Fallback

The mobile app maintains a hardcoded fallback configuration that will be used if:
- The API endpoint is unavailable
- The user is offline
- The API returns an error

This ensures the app remains functional even before this endpoint is deployed.

## TypeScript Types (for reference)

```typescript
export interface MedicationConfig {
  code: Medication;
  name: string;
  manufacturer: string | null;
  dosages: number[];
  penStrengths: number[];
  supportsMicrodosing: boolean;
}

export interface MedicationConfigResponse {
  medications: MedicationConfig[];
  microdoseAmounts: number[];
  defaultDosesPerPen: number;
}
```

Where `Medication` is: `'OZEMPIC' | 'WEGOVY' | 'MOUNJARO' | 'ZEPBOUND' | 'OTHER'`
