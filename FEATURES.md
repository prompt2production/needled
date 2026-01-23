# Feature Roadmap

Based on the project brief, here are the recommended features in build order.

## Phase 1: Foundation

- [x] **user-onboarding** — Collect starting weight, goal weight, injection day preference, and create user profile
- [x] **desktop-layout** — Convert from mobile-first to desktop-first layout with top header navigation

## Phase 2: Core Tracking

- [x] **weekly-weigh-in** — Log weight once per week with enforced timing, view weight trend over time
- [x] **injection-tracking** — Mark weekly injection as done, track schedule, send due reminders
- [x] **daily-habits** — Daily yes/no check-in for water, nutrition, and exercise habits

## Phase 3: Visualization

- [x] **dashboard** — Home screen showing weight progress, habit streaks, injection status at a glance
- [ ] **progress-calendar** — Calendar view showing habit completion patterns and weigh-in history

## Phase 4: Polish

- [ ] **notifications** — As this is a web app, users should opt to receive notifications via email (SendGrid)
- [ ] **settings** — Edit profile, change injection day, adjust goals, export data
- [ ] **login** — Ensure users revisiting can easily log back in
- [ ] **user session** — Ensure users who have logged in and still have an active session and revisit home page are taken straight to dashboard

---

## Feature Dependencies

```
user-onboarding
    └── weekly-weigh-in
    └── injection-tracking
    └── daily-habits
            └── dashboard
            └── progress-calendar
                    └── notifications
                    └── settings
```

## Notes

- **Desktop-First Approach:** All features should be designed for desktop (1280px+) with responsive mobile support. Use Dialog instead of Drawer, Header navigation instead of bottom navigation.
- **user-onboarding** must come first as all other features depend on having a user profile
- **Core tracking** features (weigh-in, injection, habits) can be built in any order after onboarding
- **dashboard** and **progress-calendar** need tracking data to display, so they come after core tracking
- **notifications** and **settings** are polish features that enhance but aren't critical for MVP

---

## Next Step

Continue building with: `Plan feature: progress-calendar`
