# Notifications Feature PRD

## Overview

Needled is a web app, so push notifications aren't available. Instead, users can opt-in to receive email reminders for key events in their weight loss journey. Emails are sent via SendGrid.

**Key notification types:**
1. **Injection Reminder** — Morning of injection day
2. **Weigh-In Reminder** — Once per week if they haven't logged
3. **Habit Check-In Reminder** — Evening reminder if habits not logged today

## User Stories

### As a user, I want to...
- Choose which email notifications I receive
- Get reminded on my injection day so I don't forget
- Get reminded to weigh in if I haven't done so this week
- Get a gentle nudge in the evening if I haven't checked in my daily habits
- Be able to turn off all notifications easily

## Requirements

### Database Schema

**NotificationPreference model:**
```prisma
model NotificationPreference {
  id               String   @id @default(cuid())
  userId           String   @unique
  injectionReminder Boolean @default(true)
  weighInReminder   Boolean @default(true)
  habitReminder     Boolean @default(false)
  reminderTime      String  @default("09:00") // HH:mm format for injection/weigh-in
  habitReminderTime String  @default("20:00") // HH:mm format for habit reminder
  timezone          String  @default("Europe/London")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**User model update:**
- Add `email` field (already exists, nullable)
- Add relation to NotificationPreference

### Email Templates

Three email templates needed:

1. **injection-reminder**
   - Subject: "Time for your [Medication] injection"
   - Body: Friendly reminder it's injection day, link to log

2. **weigh-in-reminder**
   - Subject: "Time for your weekly weigh-in"
   - Body: Reminder to step on the scale, link to log

3. **habit-reminder**
   - Subject: "Don't forget to check in today"
   - Body: Evening reminder, link to habits page

### API Endpoints

**GET /api/notifications/preferences**
- Returns current notification preferences for authenticated user
- Creates default preferences if none exist

**PUT /api/notifications/preferences**
- Updates notification preferences
- Validates timezone is valid IANA timezone

**POST /api/notifications/send** (internal/cron)
- Protected endpoint called by cron job
- Checks all users and sends appropriate notifications
- Tracks last notification sent to prevent duplicates

**POST /api/notifications/unsubscribe**
- Token-based unsubscribe link
- One-click unsubscribe from all emails

### Cron Jobs

Using Vercel Cron (vercel.json):

```json
{
  "crons": [
    {
      "path": "/api/cron/notifications",
      "schedule": "0 * * * *"  // Every hour
    }
  ]
}
```

The cron endpoint checks:
1. Current hour in each user's timezone
2. Whether reminder is due based on preferences
3. Whether action has already been taken today (injection logged, weight logged, habits logged)

### SendGrid Integration

**Environment variables:**
- `SENDGRID_API_KEY` — API key for sending
- `SENDGRID_FROM_EMAIL` — Verified sender email
- `NOTIFICATION_CRON_SECRET` — Secret to protect cron endpoint

**Email sending pattern:**
```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

await sgMail.send({
  to: user.email,
  from: process.env.SENDGRID_FROM_EMAIL!,
  subject: 'Time for your injection',
  html: renderEmailTemplate('injection-reminder', { user }),
})
```

### UI Components

**NotificationSettings component:**
- Toggle switches for each notification type
- Time pickers for reminder times
- Timezone selector (auto-detect with manual override)
- Test email button (sends test to verify delivery)
- Location: Settings page (`/settings`)

### Notification Settings UI

Per DESIGN_SYSTEM.md, use dark cards with lime accents:

```tsx
<Card className="bg-card border-border">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Bell className="h-5 w-5 text-lime" />
      Email Notifications
    </CardTitle>
    <CardDescription>
      Choose which reminders to receive
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    {/* Toggle switches for each notification type */}
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-white">Injection reminders</p>
        <p className="text-xs text-muted-foreground">Get reminded on injection day</p>
      </div>
      <Switch checked={prefs.injectionReminder} />
    </div>
    {/* ... more toggles ... */}
  </CardContent>
</Card>
```

### Email Design

Emails should match Needled's brand:
- Dark background (#050505)
- Lime accent (#BFFF00) for CTAs
- Clean, minimal layout
- Single prominent CTA button
- Unsubscribe link in footer

### Edge Cases

1. **No email on user profile** — Don't create preferences, prompt to add email in settings
2. **Invalid timezone** — Fall back to Europe/London
3. **SendGrid failure** — Log error, don't retry immediately (wait for next cron)
4. **User already completed action** — Don't send reminder
5. **User is new (< 24h old)** — Don't send reminders yet, let them explore

### Security Considerations

1. **Cron endpoint protection** — Verify secret header matches
2. **Unsubscribe tokens** — Signed JWT with userId, expires in 30 days
3. **Rate limiting** — Max one email per type per day per user
4. **Email validation** — Verify format before saving

## Success Metrics

- Notification opt-in rate > 60%
- Email open rate > 40%
- Action completion rate after reminder > 30%
- Unsubscribe rate < 5%

## Out of Scope

- SMS notifications
- Push notifications (web push)
- In-app notification center
- Notification history/log view
- Custom reminder messages
