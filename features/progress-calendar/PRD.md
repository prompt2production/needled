# Progress Calendar Feature

## Overview

A calendar view that provides a visual overview of the user's entire weight loss journey. The calendar displays daily habit completion patterns, weigh-in entries, and injection records, allowing users to see their consistency over time and identify patterns in their behaviour.

## User Stories

### Primary Use Cases

1. **See habit streaks at a glance** — Users want to see which days they completed their habits (water, nutrition, exercise) visualised on a calendar to understand their consistency patterns.

2. **Track weigh-in history visually** — Users want to see when they weighed in each week and quickly navigate to view that data.

3. **Review injection history** — Users want to see their injection dates on the calendar to verify they're maintaining their weekly schedule.

4. **Identify patterns** — Users want to spot trends like "I always skip habits on weekends" or "I consistently inject on Thursdays."

## Detailed Requirements

### Calendar View

**Monthly Grid:**
- Display a full month calendar grid (7 columns for days, 4-6 rows for weeks)
- Show abbreviated day headers (M, T, W, T, F, S, S) starting from Monday
- Grey out days from previous/next months but keep them visible for context
- Highlight today's date with a subtle ring or background
- Support month navigation (previous/next month buttons)
- Display current month and year in header (e.g., "January 2026")

**Daily Cell Indicators:**
Each day cell should show visual indicators for:

1. **Habit completion** — Three small dots (stacked vertically or horizontal) representing:
   - Water (blue dot when complete)
   - Nutrition (green dot when complete)
   - Exercise (orange dot when complete)
   - Empty/grey dot when incomplete
   - No dots shown for future dates

2. **Weigh-in marker** — Scale icon or weight badge when a weigh-in was logged that day

3. **Injection marker** — Syringe icon when an injection was logged that day

**Visual Hierarchy:**
- Injection and weigh-in icons should be most prominent
- Habit dots should be subtle but visible
- Completed habits use lime accent colour
- Current day should be visually distinct

### Day Detail View

When clicking on a calendar day, show a dialog with:

**Header:**
- Full date (e.g., "Thursday, January 23, 2026")
- Day context (e.g., "Today", "Yesterday", "2 weeks ago")

**Content sections:**

1. **Habits** (if any exist for that day)
   - Water: ✓ Done / ✗ Not done
   - Nutrition: ✓ Done / ✗ Not done
   - Exercise: ✓ Done / ✗ Not done

2. **Weigh-in** (if logged that day)
   - Weight value with unit
   - Change from previous weigh-in (e.g., "-0.8kg")

3. **Injection** (if logged that day)
   - Injection site used
   - Any notes recorded

**Empty state:** If no data exists for that day (and it's in the past), show "No activity recorded"

### Navigation

**Month Navigation:**
- Left/right arrows to navigate months
- Clicking month/year opens month picker (optional enhancement)
- Cannot navigate to future months beyond current month
- No limit on historical navigation

**Quick Navigation:**
- "Today" button to jump back to current month
- Keyboard support: Arrow keys to navigate days (enhancement)

### Page Layout

**Desktop (1280px+):**
- Full-width calendar with generous cell sizes
- Day cells approximately 80-100px square
- Detail dialog opens centered

**Tablet (768px-1279px):**
- Calendar fills available width
- Smaller cells but still comfortable touch targets (44px min)

**Mobile (<768px):**
- Full-width calendar
- Compact cell design
- Detail dialog takes more screen width

## Database Models

No new models required. Uses existing:
- `DailyHabit` — date, water, nutrition, exercise
- `WeighIn` — date, weight
- `Injection` — date, site, notes

## API Endpoints

### GET `/api/calendar/[year]/[month]`

Returns all data for a given month needed to render the calendar.

**Parameters:**
- `year` — 4-digit year (e.g., 2026)
- `month` — 1-12 (e.g., 1 for January)

**Response:**
```json
{
  "year": 2026,
  "month": 1,
  "habits": [
    { "date": "2026-01-15", "water": true, "nutrition": true, "exercise": false },
    { "date": "2026-01-16", "water": true, "nutrition": false, "exercise": true }
  ],
  "weighIns": [
    { "date": "2026-01-15", "weight": 87.2 }
  ],
  "injections": [
    { "date": "2026-01-16", "site": "ABDOMEN_LEFT" }
  ]
}
```

### GET `/api/calendar/day/[date]`

Returns detailed data for a specific day.

**Parameters:**
- `date` — ISO date string (e.g., "2026-01-15")

**Response:**
```json
{
  "date": "2026-01-15",
  "habit": { "water": true, "nutrition": true, "exercise": false },
  "weighIn": { "weight": 87.2, "previousWeight": 88.0, "change": -0.8 },
  "injection": { "site": "ABDOMEN_LEFT", "notes": "No issues" }
}
```

## UI/UX Requirements

Reference: `DESIGN_SYSTEM.md`

### Colour Usage

- **Background:** `bg-card` for calendar container
- **Day cells:** `bg-card` default, `bg-white/5` on hover
- **Today:** Subtle lime ring `ring-1 ring-lime/50`
- **Selected day:** `bg-lime/10` with `border-lime/30`
- **Non-current month days:** `text-muted-foreground/50`
- **Habit dots:** Use semantic colours (lime for complete, `white/20` for incomplete)

### Typography

- Month/year header: `text-xl font-semibold`
- Day of week headers: `text-xs text-muted-foreground uppercase`
- Day numbers: `text-sm` (current month), `text-sm text-muted-foreground/50` (other months)

### Spacing

- Calendar grid gap: `gap-1`
- Cell padding: `p-2`
- Header padding: `p-4`

### Components

- Use shadcn `Dialog` for day detail view
- Use shadcn `Button` for navigation
- Use lucide-react icons: `ChevronLeft`, `ChevronRight`, `Scale`, `Syringe`, `Droplets`, `Utensils`, `Dumbbell`

## Testing Requirements

### Unit Tests
- Calendar grid generation (correct number of days, weeks)
- Month navigation logic (boundaries, current month restrictions)
- Data aggregation for calendar view

### E2E Tests
- Navigate between months
- View day detail with all data types
- View day detail with partial data
- View empty day
- Responsive layout verification

## Out of Scope

- Editing data from the calendar (use dedicated pages)
- Weekly view alternative
- Year view
- Export/share calendar
- Custom date range selection
