# User Onboarding

## Overview

A mobile-first onboarding wizard that welcomes new users, collects essential information for their weight loss journey, and creates their profile. The flow should feel premium and motivating—not like a medical intake form.

## User Stories

1. **As a new user**, I want to enter my name so the app can personalise my experience.
2. **As a new user**, I want to enter my starting weight so I can track my progress from day one.
3. **As a new user**, I want to set a goal weight so I have something to work toward.
4. **As a new user**, I want to select my medication type so the app understands my journey.
5. **As a new user**, I want to choose my injection day so the app can remind me at the right time.

## Detailed Requirements

### Onboarding Flow

The onboarding consists of 5 steps presented as a wizard:

#### Step 1: Welcome
- Display app logo/name with the tagline
- "Let's get you set up" introduction
- Single "Get Started" CTA button
- No inputs on this screen—just a warm welcome

#### Step 2: Name
- "What should we call you?"
- Single text input for name/nickname
- Minimum 2 characters, maximum 30 characters
- "Continue" button (disabled until valid)

#### Step 3: Starting Weight
- "What's your current weight?"
- Numeric input with unit toggle (kg/lbs)
- Range: 40-300 kg or 90-660 lbs
- Show selected unit clearly
- "Continue" button

#### Step 4: Goal Weight
- "What's your goal weight?"
- Same input style as starting weight
- Must be lower than starting weight
- Show difference: "That's X kg to lose"
- "Continue" button
- Optional "Skip" link (sets goal to null)

#### Step 5: Medication & Injection Day
- "Which medication are you on?"
- Select from: Ozempic, Wegovy, Mounjaro, Zepbound, Other
- "Which day do you take your injection?"
- Day picker: M T W T F S S (radio selection)
- "Complete Setup" button

### After Completion

- Show brief success screen: "You're all set, {name}!"
- Redirect to home/dashboard after 2 seconds
- Create user profile in database

### Progress Indicator

- Show step progress at top: "Step 2 of 5" or visual dots
- Back button available on steps 2-5 to go back
- Progress persists if user accidentally closes (store in localStorage)

## Database Model

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  startWeight   Float     // stored in kg
  goalWeight    Float?    // optional, stored in kg
  weightUnit    String    @default("kg") // "kg" or "lbs"
  medication    String    // "ozempic", "wegovy", "mounjaro", "zepbound", "other"
  injectionDay  Int       // 0=Sunday, 1=Monday, ... 6=Saturday
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Weight Conversion
- Always store weight in kg internally
- Convert to/from lbs for display when unit preference is "lbs"
- 1 kg = 2.20462 lbs

## API Endpoints

### POST /api/users
Create a new user profile.

**Request:**
```json
{
  "name": "Chris",
  "startWeight": 95.5,
  "goalWeight": 80.0,
  "weightUnit": "kg",
  "medication": "mounjaro",
  "injectionDay": 1
}
```

**Response (201):**
```json
{
  "id": "clx...",
  "name": "Chris",
  "startWeight": 95.5,
  "goalWeight": 80.0,
  "weightUnit": "kg",
  "medication": "mounjaro",
  "injectionDay": 1,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Error Response (400):**
```json
{
  "error": [
    { "path": ["name"], "message": "Name is required" }
  ]
}
```

### GET /api/users/:id
Retrieve user profile (for future use).

## UI/UX Requirements

### Visual Style
- Follow DESIGN_SYSTEM.md dark mode patterns
- Full-screen steps, no cards (immersive experience)
- Large, centered content
- Lime accent on primary CTA buttons
- Muted text for helper text and descriptions

### Layout per Step
```
[Progress indicator - dots or "Step X of 5"]

[Icon or illustration - optional]

[Heading - text-2xl font-semibold]
[Subheading - text-muted-foreground]

[Input area - centered, generous spacing]

[Continue button - full width, bg-lime, h-12]
[Back/Skip link - text-muted-foreground, below button]
```

### Input Styling
- Large touch targets (min 48px height)
- Clear focus states with lime ring
- Unit toggle as pill buttons (kg | lbs)
- Day selector as horizontal row of circles (like habit indicators)

### Transitions
- Subtle slide animation between steps
- Don't make users wait—keep it snappy

### Accessibility
- All inputs properly labelled
- Error messages announced to screen readers
- Keyboard navigation works (Tab, Enter, Escape)

## Validation Rules

| Field | Validation |
|-------|------------|
| name | Required, 2-30 characters, trimmed |
| startWeight | Required, 40-300 kg (or 90-660 lbs) |
| goalWeight | Optional, must be < startWeight if provided |
| weightUnit | Required, "kg" or "lbs" |
| medication | Required, one of allowed values |
| injectionDay | Required, 0-6 |

## Edge Cases

1. **User closes mid-onboarding**: Store progress in localStorage, resume on return
2. **Goal weight > start weight**: Show validation error inline
3. **Same goal as start**: Show validation error "Goal must be lower than starting weight"
4. **Very long name**: Truncate in display, store full value

## Testing Requirements

### Unit Tests
- Validation schema tests for all fields
- Weight conversion utility functions
- Form component renders correctly

### E2E Tests
- Complete happy path: user fills all steps, profile created
- Back navigation works correctly
- Skip goal weight option works
- Validation errors display correctly
- User redirected to home after completion

## Definition of Done

- [ ] Prisma User model created and migrated
- [ ] API endpoint POST /api/users works with validation
- [ ] All 5 onboarding steps render correctly
- [ ] Form validation works client-side and server-side
- [ ] Weight unit toggle works (kg/lbs)
- [ ] Day picker works
- [ ] Progress persists in localStorage
- [ ] Success screen shows after completion
- [ ] User redirected to home page
- [ ] Unit tests pass
- [ ] E2E test passes
- [ ] Mobile responsive (375px+)
