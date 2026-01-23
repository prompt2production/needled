# Weekly Weigh-In Feature

## Overview

The weekly weigh-in feature allows users to log their weight once per week. This intentional constraint prevents obsessive daily weighing while maintaining consistent progress tracking. Users can view their weight trend over time to see progress toward their goal.

## User Stories

1. As a user, I want to log my weight so I can track my progress
2. As a user, I want to be prevented from weighing in too frequently so I develop healthy tracking habits
3. As a user, I want to see how my weight has changed since my last weigh-in
4. As a user, I want to see my overall progress toward my goal weight
5. As a user, I want to view my weight history over time

## Detailed Requirements

### Database Model

**WeighIn**
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | Foreign key to User |
| weight | Float | Weight value (stored in user's preferred unit) |
| date | DateTime | Date of weigh-in |
| createdAt | DateTime | Record creation timestamp |

**Relationship:** User has many WeighIns

### Business Rules

1. **Weekly Enforcement**
   - Users can only log one weigh-in per calendar week (Monday-Sunday)
   - If a weigh-in exists for the current week, show the logged value instead of the input form
   - Show countdown to next allowed weigh-in when blocked

2. **Validation**
   - Weight must be within valid range: 40-300 kg or 90-660 lbs
   - Weight must be a positive number with up to 1 decimal place
   - Date cannot be in the future

3. **Trend Calculations**
   - Week-over-week change: current weight - previous weigh-in
   - Total change: current weight - starting weight
   - Progress percentage: (starting - current) / (starting - goal) * 100

### API Endpoints

**POST /api/weigh-ins**
- Create a new weigh-in for the authenticated user
- Validates weekly constraint (returns 409 if already weighed in this week)
- Request body: `{ weight: number }`
- Returns: Created weigh-in with trend data

**GET /api/weigh-ins**
- Get weigh-in history for the user
- Query params: `?limit=10&offset=0`
- Returns: Array of weigh-ins, ordered by date descending

**GET /api/weigh-ins/latest**
- Get the most recent weigh-in with trend data
- Returns: Latest weigh-in, week-over-week change, total change, can_weigh_in boolean

### UI Components

#### WeighInCard
Main card displayed on the home/dashboard page.

**States:**
1. **Can Weigh In** - Shows input form with weight field and "Log Weight" button
2. **Already Logged** - Shows logged weight for this week with trend
3. **No History** - First-time state, encouraging message

**Elements:**
- Large weight display (text-4xl per DESIGN_SYSTEM.md)
- Trend indicator with color: lime for loss, red for gain
- Week indicator (e.g., "This week" or "Logged 3 days ago")

#### WeighInHistoryList
List of previous weigh-ins for the progress/history view.

**Elements:**
- Date (formatted as "Mon 15 Jan")
- Weight value
- Change from previous (with +/- and color)
- Optional: small spark line showing recent trend

#### WeighInInput
Bottom sheet/drawer for entering a new weigh-in.

**Elements:**
- Large numeric input with unit suffix
- Current date displayed (read-only)
- "Log Weight" primary button
- Cancel button

### UI/UX Flow

1. User opens app → sees WeighInCard on dashboard
2. If can weigh in: Card shows "Log your weight" prompt with button
3. User taps button → WeighInInput bottom sheet opens
4. User enters weight → taps "Log Weight"
5. Success toast shows with trend ("Down 0.8 kg from last week!")
6. Card updates to show logged weight with trend

### Edge Cases

1. **First Weigh-In:** Starting weight from onboarding becomes the baseline. Card should say "Log your first weigh-in" and not show trend data.

2. **Weight Gain:** Show change in red with TrendingUp icon. Keep tone neutral/supportive, not shaming.

3. **No Goal Weight:** Progress percentage unavailable. Only show absolute change.

4. **Week Boundary:** Weigh-in window resets Monday 00:00 in user's local timezone.

## Success Metrics

- Users log weight at least 3 out of 4 weeks
- No user complaints about being blocked from weighing in
- Clear understanding of when next weigh-in is allowed

## Technical Notes

- Store weight in user's preferred unit (no conversion at storage)
- Use date-fns for week calculations with proper timezone handling
- Consider offline support for logging (future enhancement)
