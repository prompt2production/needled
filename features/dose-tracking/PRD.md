# Dose Tracking Feature

## Overview

Enhance the injection tracking feature to track which dose number (1-4) the user is on within their current medication pen/syringe. GLP-1 medications like Ozempic and Mounjaro typically come in pens containing 4 doses. This feature helps users know how many doses remain and when they need to reorder.

## User Stories

### Core Functionality
1. As a user logging an injection, I want to see which dose number this is (1-4) so I know where I am in my current pen
2. As a user, I want the dose number to auto-calculate from my previous injection so I don't have to remember
3. As a user, I want to be able to change the dose number when logging (e.g., if I started a new pen) so the tracking stays accurate
4. As a user, I want to see how many doses are remaining in my current pen on the injection page

### Display & History
5. As a user, I want to see the dose number in my injection history so I can track pen usage over time
6. As a user, I want to be able to edit the dose number on past injections to correct mistakes

## Detailed Requirements

### Dose Number Logic
- **Range**: 1-4 (representing 4 doses per pen)
- **Auto-calculation**:
  - If last injection was dose 1, 2, or 3 → suggest dose + 1
  - If last injection was dose 4 → suggest dose 1 (new pen)
  - If no previous injection → suggest dose 1
- **Override**: User can always manually select a different dose number

### Database Changes
Add `doseNumber` field to Injection model:
```prisma
model Injection {
  // ... existing fields ...
  doseNumber Int @default(1)  // 1-4
}
```

### API Changes

#### POST /api/injections
- Accept optional `doseNumber` in request body
- If not provided, auto-calculate from last injection
- Validate: must be integer 1-4

#### PATCH /api/injections/[id]
- Accept optional `doseNumber` in request body
- Validate: must be integer 1-4

#### GET /api/injections/status
- Add to response:
  - `currentDose`: The dose number of the most recent injection (or null if none)
  - `nextDose`: The suggested next dose number (1-4)
  - `dosesRemaining`: How many doses left in current pen (calculated as 4 - currentDose, or 4 if currentDose is 4)

### UI Changes

#### InjectionDialog (Log Injection)
- Add dose number selector below site selector
- Display as 4 horizontal buttons labeled "1", "2", "3", "4"
- Auto-select the suggested dose (highlighted)
- Show helper text: "Dose X of 4" with "(new pen)" indicator for dose 1
- Allow clicking any dose to override

#### InjectionEditDialog
- Add same dose number selector for editing past injections

#### Injection Page
- **Remove**: Site Rotation Summary card
- **Add**: Doses Remaining card showing:
  - Current pen status: "Dose X of 4"
  - Visual progress (4 dots or progress indicator)
  - Doses remaining count: "X doses remaining"
  - When on dose 4: Show "Last dose - time to reorder"

#### InjectionHistory
- Display dose number alongside site information
- Format: "Dose X • Left Abdomen"

#### InjectionCard (optional enhancement)
- In "done" state, show "Dose X of 4" under the injection details

## UI/UX Notes

### Dose Selector Design
- 4 buttons in a horizontal row
- Suggested dose has lime/primary styling
- Other doses have neutral styling
- Clear visual distinction between selected and suggested

### Doses Remaining Card
- Replace the current Site Rotation Summary card position
- Use a visual indicator (filled/empty circles or progress bar)
- Primary color for used doses, muted for remaining
- Include reorder reminder when on dose 4

## Edge Cases

1. **New user with no injections**: Suggest dose 1
2. **User starts new pen early**: They can select dose 1 manually
3. **User skips a dose or pen**: They can select any dose number
4. **Migration**: Existing injections without doseNumber default to 1

## Success Criteria

1. Users can log injections with dose numbers
2. Dose number auto-calculates correctly based on history
3. Users can override the suggested dose
4. Doses remaining is clearly visible on injection page
5. Dose numbers appear in injection history
6. Past injections can have dose numbers edited
