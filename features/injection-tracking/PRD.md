# Injection Tracking - Product Requirements Document

## Overview

Injection tracking allows users to log their weekly GLP-1 medication injections, track injection sites for proper rotation, and receive visual reminders when injections are due. This feature is critical for medication adherence and safety.

## User Stories

### Primary User Flows

1. **Log Weekly Injection**
   - As a user, I want to log when I've completed my weekly injection so I can track my medication schedule
   - I should be able to record which body site I used for proper rotation

2. **View Injection Status**
   - As a user, I want to see at a glance whether my injection is due, done, or overdue
   - I should see a countdown or reminder when my injection day approaches

3. **Track Injection Sites**
   - As a user, I want to rotate injection sites to avoid tissue damage
   - I should see which site I used last time and get a suggestion for the next site

4. **View Injection History**
   - As a user, I want to see my injection history to track adherence over time

## Detailed Requirements

### Database Model

**Injection**
- `id`: String (cuid)
- `userId`: String (foreign key to User)
- `date`: DateTime (when injection was logged)
- `site`: InjectionSite enum
- `notes`: String? (optional user notes)
- `createdAt`: DateTime

**InjectionSite enum:**
- `ABDOMEN_LEFT`
- `ABDOMEN_RIGHT`
- `THIGH_LEFT`
- `THIGH_RIGHT`
- `UPPER_ARM_LEFT`
- `UPPER_ARM_RIGHT`

### Injection Week Logic

The injection week is calculated based on the user's `injectionDay` preference (0-6, where 0 = Monday):
- Week starts from user's injection day and runs for 7 days
- Example: If user's injection day is Wednesday (2), their injection week runs Wed-Tue

### Injection Status States

1. **Due Today** - Today is the user's injection day and no injection logged this week
2. **Done** - Injection already logged for this week (show when it was done)
3. **Overdue** - Past the injection day and no injection logged (show days overdue)
4. **Upcoming** - Before the injection day this week (show days until due)

### API Endpoints

**POST /api/injections**
- Create a new injection record
- Validate only one injection per week
- Return 409 if injection already exists for current injection week

**GET /api/injections**
- Fetch injection history for user
- Support pagination (limit, offset)
- Order by date descending

**GET /api/injections/status**
- Get current injection status for user
- Return: status (due/done/overdue/upcoming), daysUntil/daysOverdue, lastInjection, suggestedSite

### UI Components

**InjectionCard**
Desktop card displaying injection status with different states:

1. **Due Today state:**
   - Accent border/background (lime glow)
   - Syringe icon
   - "Injection Day" heading
   - "Log Injection" primary button
   - Body site selector in dialog

2. **Done state:**
   - Standard card styling
   - Check icon with lime accent
   - "Done" badge
   - Shows date logged and site used
   - "View History" link

3. **Overdue state:**
   - Warning styling (amber/red accent)
   - Alert icon
   - "Overdue by X days" text
   - "Log Injection" button (still available)

4. **Upcoming state:**
   - Muted styling
   - "X days until injection" countdown
   - Subtle card, not prominent

**InjectionDialog**
Dialog for logging injection:
- Body map or site selector (6 options)
- Visual indicator of last used site
- Suggested next site highlighted
- Optional notes field
- Submit and cancel buttons

**InjectionHistory**
List/table view of past injections:
- Date
- Site used
- Notes if any
- Grouped by month or week

### Site Rotation Logic

Recommend the next injection site based on:
1. Avoid last used site
2. Rotate through sites in order: Abdomen L -> Abdomen R -> Thigh L -> Thigh R -> Arm L -> Arm R
3. If no history, default to Abdomen Left

### Page Locations

- **Home page (/home):** Show InjectionCard in dashboard grid
- **Injection page (/injection):** Dedicated page with full history and site rotation visualization

### Navigation

Add "Injection" to header navigation with Syringe icon.

## UI/UX Requirements

- Follow DESIGN_SYSTEM.md for all styling
- Use Dialog component for injection logging (not Drawer)
- Card accent styling for "Due Today" state per design system
- Lime accent for positive states, amber for overdue
- Large, tappable site selection targets (44x44px minimum)
- Toast confirmation on successful logging

## Acceptance Criteria

1. User can log a weekly injection with site selection
2. System enforces one injection per injection week
3. Injection status accurately reflects due/done/overdue/upcoming
4. Site rotation suggestion works correctly
5. Injection history displays correctly
6. Works on desktop (1280px+) and mobile (375px+)
7. All unit and e2e tests pass

## Out of Scope

- Push notifications (separate feature)
- Medication dosage tracking
- Multiple medication types per user
- Integration with pharmacy/prescription systems
