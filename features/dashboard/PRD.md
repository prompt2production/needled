# Dashboard Feature PRD

## Overview

The dashboard is the main home screen for authenticated users, providing an at-a-glance view of their weight loss journey. It aggregates data from weight tracking, injection logging, and daily habits into a unified, motivating interface.

The current `/home` page displays basic cards linking to features. This feature transforms it into a rich, data-driven dashboard with visual progress indicators and contextual CTAs.

## User Stories

### As a user, I want to see my weight progress at a glance
- Display current weight prominently
- Show progress toward goal weight with a visual progress ring
- Display total weight lost since starting
- Show week-over-week change with trend indicator (up/down arrow)
- CTA to log weight if allowed this week (weekly restriction)

### As a user, I want to see my injection status
- The existing `InjectionCardConnected` component handles this
- Shows due/done/overdue status
- Days until next injection or days overdue
- Quick log button

### As a user, I want to see my daily habit status
- The existing `HabitsCard` component handles this
- Today's three habits with toggle
- Displays weekly completion stats

### As a user, I want to see summary statistics
- Total weeks on journey
- Current week number
- Habit completion rate (% of habits done this week)

## Detailed Requirements

### Dashboard Layout

```
┌────────────────────────────────────────────────────────────────┐
│  Header: "Hey, {name}" / "Let's check in on your journey"     │
├───────────────────────────────┬────────────────────────────────┤
│                               │                                │
│  Weight Progress Card         │  Daily Habits Card             │
│  ┌─────────────────────────┐ │  ┌────────────────────────────┐│
│  │  [Progress Ring]        │ │  │  Water      [  ] / [✓]    ││
│  │   -8.5 kg lost          │ │  │  Nutrition  [  ] / [✓]    ││
│  │                         │ │  │  Exercise   [  ] / [✓]    ││
│  │  87.2 kg                │ │  │                            ││
│  │  ↓ -0.8 this week       │ │  │  2/3 done today            ││
│  │                         │ │  └────────────────────────────┘│
│  │  [Log This Week's       │ │                                │
│  │   Weight]               │ │                                │
│  └─────────────────────────┘ │                                │
│                               │                                │
│  Injection Card               │  Journey Stats Card            │
│  ┌─────────────────────────┐ │  ┌────────────────────────────┐│
│  │  [Syringe Icon]         │ │  │  Week 8 of your journey    ││
│  │  Ozempic - Due Tuesday  │ │  │  85% habits this week      ││
│  │  2 days until           │ │  │  8 weigh-ins logged        ││
│  │                         │ │  └────────────────────────────┘│
│  │  [Mark as Done]         │ │                                │
│  └─────────────────────────┘ │                                │
│                               │                                │
└───────────────────────────────┴────────────────────────────────┘
```

### Weight Progress Card

**Displays:**
- **Progress ring** showing percentage toward goal weight
  - Ring fills as user loses weight
  - Center shows total kg/lbs lost
- **Current weight** prominently displayed
- **Week change** with trend indicator icon
  - Green down arrow for loss
  - Red up arrow for gain
  - Neutral for no change
- **CTA button:**
  - "Log This Week's Weight" if user hasn't logged this week
  - Hidden or shows "Logged" badge if already logged

**States:**
- Loading: Skeleton with pulsing ring and text
- No weigh-ins yet: Shows starting weight, encourages first weigh-in
- With data: Full progress display

### Journey Stats Card

**Displays:**
- **Week number:** "Week X of your journey"
- **Habit completion:** "X% habits this week" (habits done / possible habits)
- **Weigh-ins logged:** Total count

### Dashboard API

Create a single `/api/dashboard` endpoint that aggregates all necessary data:

```typescript
// GET /api/dashboard?userId={userId}
interface DashboardResponse {
  user: {
    name: string
    startWeight: number
    goalWeight: number | null
    weightUnit: 'kg' | 'lbs'
    medication: string
    injectionDay: number
    createdAt: string
  }
  weight: {
    current: number | null
    lastDate: string | null
    weekChange: number | null
    totalChange: number | null
    progressPercent: number | null // % toward goal
    canWeighIn: boolean
    totalWeighIns: number
  }
  habits: {
    today: {
      water: boolean
      nutrition: boolean
      exercise: boolean
    }
    weeklyCompletionPercent: number // 0-100
  }
  journey: {
    weekNumber: number // How many weeks since user started
    startDate: string
  }
}
```

### UI/UX Requirements

- Follow DESIGN_SYSTEM.md for all styling
- Progress ring uses lime color for fill, subtle white/gray for background
- Cards use standard `bg-card rounded-xl border border-border p-4` pattern
- Desktop: 2-column grid layout (lg:grid-cols-2)
- Mobile: Single column stack
- Loading states use skeleton placeholders with `animate-pulse`
- All numbers should be clearly visible at a glance (large text)

## Database Models

No new models required. Uses existing:
- `User` - name, weights, medication, injection day
- `WeighIn` - weight history
- `Injection` - injection history
- `DailyHabit` - habit completion

## API Endpoints

### GET /api/dashboard

**Query params:** `userId` (required)

**Response:** `DashboardResponse` as defined above

**Implementation:**
1. Fetch user by ID
2. Fetch latest weigh-in and calculate changes
3. Fetch today's habits
4. Fetch this week's habits for completion %
5. Calculate journey week number
6. Return aggregated response

## Components

### New Components

1. **WeightProgressCard** - `src/components/dashboard/WeightProgressCard.tsx`
   - Progress ring with percentage
   - Current weight display
   - Week change with trend
   - Log weight CTA

2. **ProgressRing** - `src/components/dashboard/ProgressRing.tsx`
   - SVG-based circular progress indicator
   - Configurable size, value, max
   - Center slot for content

3. **JourneyStatsCard** - `src/components/dashboard/JourneyStatsCard.tsx`
   - Week number
   - Habit completion %
   - Total weigh-ins

### Existing Components (reused)

- `InjectionCardConnected` - Already handles injection status
- `HabitsCard` - Already handles daily habit toggling

## Testing Requirements

### Unit Tests (Vitest)
- Dashboard API response validation
- Progress percentage calculations
- Week number calculations
- Edge cases (no weigh-ins, no goal weight)

### E2E Tests (Playwright)
- Dashboard loads with all cards
- Weight progress displays correctly
- Can log weight from dashboard if allowed
- Injection card functions correctly
- Habit toggles work from dashboard
- Responsive layout (desktop and mobile viewports)

## Definition of Done

1. Dashboard API returns aggregated data
2. Weight progress card shows ring, current weight, changes
3. Journey stats card shows week number and completion rate
4. Existing injection and habit cards work on dashboard
5. Desktop 2-column and mobile single-column layouts
6. Loading and empty states implemented
7. All unit tests pass
8. All E2E tests pass
9. No TypeScript errors
10. No console errors
