# Daily Habits Feature

## Overview

The daily habits feature enables users to perform simple yes/no check-ins for three foundational habits: hydration (water), nutrition, and movement (exercise). This builds daily mindfulness without the complexity of detailed tracking.

## User Stories

1. **As a user**, I want to check off my daily habits so I can maintain accountability for healthy behaviours.
2. **As a user**, I want to see my habit completion for the current week so I know how consistent I've been.
3. **As a user**, I want to see visual feedback when I complete habits so I feel motivated.
4. **As a user**, I want to access my habits from the home page so check-ins are quick and convenient.

## Requirements

### Three Habits

| Habit | Icon | Description |
|-------|------|-------------|
| Water | `Droplets` | Did you drink enough water today? |
| Nutrition | `Utensils` | Did you eat mindfully today? |
| Exercise | `Dumbbell` | Did you move your body today? |

### Check-in Rules

- Users can check in once per day per habit
- Check-ins are simple yes/no (toggle on/off)
- Users can uncheck a habit if marked by mistake
- Check-ins reset at midnight (local time)
- Users can check habits for the current day only (no backdating)

### Weekly View

- Show current week's habits in a M-T-W-T-F-S-S grid
- Each day shows completion state per the design system:
  - **Completed**: Solid lime fill
  - **Not done (past)**: Border only, muted
  - **Today (not done)**: Border only, clickable
  - **Future**: Very muted/dimmed, not clickable
- Week starts on Monday

### Visual Design

Following DESIGN_SYSTEM.md habit indicators:

```tsx
// Completed day
className="bg-lime text-black"

// Past day not completed
className="border border-white/20 text-white/40"

// Today (not done)
className="border border-white/20 text-white/60"

// Future day
className="border border-white/10 text-white/20"
```

## Database Model

```prisma
model DailyHabit {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime @db.Date
  water     Boolean  @default(false)
  nutrition Boolean  @default(false)
  exercise  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId, date])
}
```

**Notes:**
- One record per user per day
- All habits default to false
- Unique constraint ensures one record per user per date
- Date stored as date-only (no time component)

## API Endpoints

### GET /api/habits

Fetch habits for a date range.

**Query Parameters:**
- `userId` (required): User ID
- `startDate` (optional): Start of date range (ISO date string)
- `endDate` (optional): End of date range (ISO date string)

**Response:**
```json
{
  "habits": [
    {
      "id": "...",
      "date": "2025-01-20",
      "water": true,
      "nutrition": true,
      "exercise": false
    }
  ]
}
```

### GET /api/habits/today

Fetch or create today's habit record.

**Query Parameters:**
- `userId` (required): User ID

**Response:**
```json
{
  "id": "...",
  "date": "2025-01-20",
  "water": false,
  "nutrition": false,
  "exercise": false
}
```

### PATCH /api/habits/today

Toggle a specific habit for today.

**Request Body:**
```json
{
  "userId": "...",
  "habit": "water",
  "value": true
}
```

**Response:**
```json
{
  "id": "...",
  "date": "2025-01-20",
  "water": true,
  "nutrition": false,
  "exercise": false
}
```

## Components

### HabitCheckIn

Single habit row with toggleable indicator for today.

```tsx
<HabitCheckIn
  habit="water"
  label="Water"
  icon={Droplets}
  checked={false}
  onToggle={(habit, value) => void}
/>
```

### HabitWeekGrid

Weekly grid showing habit completion pattern.

```tsx
<HabitWeekGrid
  habit="water"
  label="Water"
  icon={Droplets}
  weekData={[
    { date: '2025-01-20', completed: true },
    { date: '2025-01-21', completed: false },
    // ...
  ]}
  today="2025-01-22"
  onTodayToggle={(habit, value) => void}
/>
```

### HabitsCard

Card showing all three habits with check-in UI.

```tsx
<HabitsCard userId={userId} />
```

**States:**
- Loading: Skeleton placeholders
- Today's check-ins with toggleable circles
- Week-at-a-glance grid below each habit

### HabitsPage

Dedicated habits page with extended history.

## UI/UX Flow

### Home Page Integration

1. HabitsCard appears on home page dashboard
2. Shows three habit rows with today's status
3. User taps a habit circle to toggle
4. Circle animates to filled lime on completion
5. Toast confirms: "Water logged" / "Water removed"

### Habits Page

1. Extended view with weekly grid for each habit
2. Shows streak information (future enhancement)
3. Provides context about each habit

## Definition of Done

1. Database model created with migration
2. Validation schemas implemented
3. All API endpoints working with tests
4. HabitCheckIn component styled per design system
5. HabitWeekGrid component styled per design system
6. HabitsCard integrated on home page
7. Habits page created with navigation
8. E2E tests passing
9. Responsive on desktop and mobile
