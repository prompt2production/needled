# Product Overview: Needled

## What is Needled?

Needled is a desktop-first web application designed as a companion for people on weight loss journeys using GLP-1 medications (Ozempic, Wegovy, Mounjaro, Zepbound). It brings together injection tracking, weekly weigh-ins, and daily habit check-ins into a single, focused experience that enforces healthy behaviours by design.

## The Problem We Solve

People using weight loss injections face a unique challenge: they need to maintain consistency across multiple dimensions simultaneously. They must take their weekly injection on schedule, monitor weight without obsessing over daily fluctuations, and build sustainable habits around hydration, nutrition, and movement.

Most health apps fail this audience in one of two ways:
- **Too complex:** Calorie counting, detailed macro tracking, and workout logging create friction and overwhelm
- **Too narrow:** Simple weight trackers miss the holistic nature of the GLP-1 journey

Needled fills this gap with focused simplicity—just enough structure to build consistency without becoming another chore.

## Target Audience

People on weight loss injection journeys who want structure without complexity. Those who find comprehensive health apps overwhelming but need more than a simple weight tracker. Users who value mindfulness over micromanagement.

## Platform Strategy

- **Web app:** Desktop-first experience (1280px+) with responsive mobile support
- **Native apps:** Separate iOS/Android development planned (not this codebase)

---

## Core Features

### User Onboarding

New users complete a guided setup flow that captures:
- **Name** for personalisation
- **Starting weight** with unit preference (kg or lbs)
- **Goal weight** (optional) for progress tracking
- **Medication type** (Ozempic, Wegovy, Mounjaro, Zepbound, or Other)
- **Preferred injection day** for schedule alignment

The onboarding establishes the foundation for all tracking features.

### Authentication & Sessions

Secure email/password authentication with persistent sessions:
- Users create accounts during onboarding or can register later
- Sessions remain active for returning visits
- Protected routes ensure data privacy
- Password change functionality in settings

### Weekly Weigh-Ins

Users log their weight with intentional constraints that promote healthy tracking behaviour:

- **Weekly-only logging** encourages focus on long-term trends rather than daily fluctuations
- **Flexible date selection** allows logging for past dates if missed
- **Edit and delete** functionality for correcting mistakes
- **Trend visualisation** shows progress over time with a weight chart
- **Progress indicators** show weight lost and percentage toward goal

The design philosophy: celebrate trajectory, not any single data point.

### Injection Tracking

Comprehensive injection management for medication adherence:

- **Site rotation tracking** across six injection sites (left/right abdomen, thighs, upper arms)
- **Visual body map** shows last injection site and suggests next rotation
- **Dose tracking** monitors which dose (1-4) of the current pen is being used
- **Doses remaining indicator** shows how many injections left before needing a new pen
- **Flexible logging** with date selection and edit/delete capabilities
- **Schedule awareness** knows when the next injection is due
- **History view** of all past injections

### Daily Habit Check-In

Three simple yes/no questions create a moment of daily reflection:
- **Water:** Did I drink enough water today?
- **Nutrition:** Did I eat healthily today?
- **Exercise:** Did I move my body today?

No calorie counting. No workout logging. No detail required—just honest self-reflection. This lightweight approach removes friction while building mindfulness around foundational habits.

### Dashboard

The home screen answers "How am I doing?" at a glance:

- **Progress ring** showing weight loss toward goal
- **Journey statistics** (weight lost, days on journey, weeks tracked)
- **Injection status** with next due date and doses remaining
- **Today's habits** completion state
- **Quick actions** for logging weigh-ins and injections

Everything visible without scrolling or tapping. The interface celebrates positive momentum and gently highlights areas needing attention.

### Progress Calendar

A calendar view provides visual feedback on consistency:

- **Habit completion patterns** shown with colour-coded indicators
- **Weigh-in history** marked on calendar dates
- **Injection history** visible at a glance
- **Streak tracking** for consecutive days of habit completion
- **Pattern recognition** helps users identify which days tend to slip

The visual "don't break the chain" motivation loop reinforces consistency.

### Email Notifications

Opt-in reminders via SendGrid keep users on track:

- **Injection reminders** on the preferred injection day
- **Weigh-in reminders** weekly
- **Habit reminders** in the evening (optional)
- **Customisable timing** for each notification type
- **Timezone support** for accurate delivery

### Settings & Account Management

Full control over profile and data:

- **Edit profile** (name, weight unit, medication, injection day)
- **Change email** with validation
- **Change password** securely
- **Adjust goal weight** as journey progresses
- **Export data** in JSON format for portability
- **Delete account** with full data removal

---

## Technical Implementation

### Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS + shadcn/ui
- **Forms:** react-hook-form + Zod validation
- **Email:** SendGrid for notifications
- **Testing:** Vitest (unit) + Playwright (E2E)

### Data Model

```
User
├── Profile (name, email, weights, medication, injection day)
├── Sessions (authentication tokens)
├── WeighIns (date, weight)
├── Injections (date, site, dose number)
├── DailyHabits (date, water, nutrition, exercise)
└── NotificationPreference (reminders, times, timezone)
```

### Design Philosophy

- **Desktop-first:** Optimised for 1280px+ with graceful mobile degradation
- **Top navigation:** Clean header-based navigation (not sidebar)
- **Card-based layout:** Content organised in focused, scannable cards
- **Minimal friction:** Quick actions, sensible defaults, no unnecessary steps
- **Calming palette:** Blues and grays that feel supportive, not clinical

---

## Success Criteria

Needled succeeds when users:
- Open it daily for their habit check-in
- Feel motivated (not overwhelmed) by what they see
- Maintain better consistency with their injection schedule
- Build sustainable healthy habits around the three pillars

It fails if it becomes another abandoned app or feels like a burden rather than support.

---

## Future Considerations

Potential enhancements for future development:
- Native iOS/Android applications
- Photo progress tracking
- Community features (anonymous progress sharing)
- Integration with health platforms (Apple Health, Google Fit)
- Medication dosage tracking (as titration schedules vary)
- Healthcare provider sharing/reports

---

## Development Status

**All planned features complete.** The application is fully functional with:
- 12 features across 5 development phases
- 195+ user stories implemented
- Comprehensive E2E test coverage
- Production-ready authentication and data management
