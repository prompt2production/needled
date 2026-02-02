# Push Notifications API Requirements

This document outlines the backend API changes required to support push notifications in the Needled mobile app.

---

## Overview

The mobile app uses **Expo Push Notifications** which provides a unified interface to Apple Push Notification Service (APNs) and Firebase Cloud Messaging (FCM). The backend needs to:

1. Store device push tokens
2. Send notifications via Expo's push service
3. Handle token lifecycle (registration, updates, removal)

---

## Architecture

```
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│   Mobile App    │     │   Expo Push Service │     │   APNs / FCM    │
│   (Expo)        │     │   (Anthropic hosts) │     │   (Apple/Google)│
└────────┬────────┘     └──────────┬──────────┘     └────────┬────────┘
         │                         │                          │
         │ 1. Get Push Token       │                          │
         │◄────────────────────────│                          │
         │                         │                          │
         │ 2. Register Token       │                          │
         │ POST /api/users/push-token                         │
         ▼                         │                          │
┌─────────────────┐                │                          │
│   Your Backend  │                │                          │
│                 │ 3. Send Notification                      │
│   - Store token │ POST https://exp.host/--/api/v2/push/send │
│   - Cron job    │────────────────►                          │
│                 │                │ 4. Deliver               │
└─────────────────┘                │──────────────────────────►
```

---

## Database Changes

### Add Push Token Storage

Add a new table or extend the User table to store push tokens:

```sql
-- Option 1: Add column to users table (simpler, single device per user)
ALTER TABLE users ADD COLUMN expo_push_token VARCHAR(255);
ALTER TABLE users ADD COLUMN push_token_platform VARCHAR(10); -- 'ios' or 'android'
ALTER TABLE users ADD COLUMN push_token_updated_at TIMESTAMP;

-- Option 2: Separate table (supports multiple devices per user)
CREATE TABLE user_push_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expo_push_token VARCHAR(255) NOT NULL,
  platform VARCHAR(10) NOT NULL, -- 'ios' or 'android'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, expo_push_token)
);
```

**Recommendation:** Start with Option 1 (single device) for MVP. Most users only use one device.

---

## New API Endpoints

### POST /api/users/push-token

Register or update the user's Expo push token.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "ios" | "android"
}
```

**Validation:**
- `token`: Required, string, must start with `ExponentPushToken[`
- `platform`: Required, enum: `ios`, `android`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Push token registered successfully"
}
```

**Behavior:**
- If user already has a token, update it (device reinstall, token refresh)
- Store the timestamp for token lifecycle management

**Implementation Notes:**
```javascript
// Express.js example
app.post('/api/users/push-token', auth, async (req, res) => {
  const { token, platform } = req.body;
  const userId = req.user.id;

  // Validate token format
  if (!token?.startsWith('ExponentPushToken[')) {
    return res.status(400).json({ error: 'Invalid push token format' });
  }

  await db.user.update({
    where: { id: userId },
    data: {
      expoPushToken: token,
      pushTokenPlatform: platform,
      pushTokenUpdatedAt: new Date(),
    },
  });

  res.json({ success: true, message: 'Push token registered successfully' });
});
```

---

### DELETE /api/users/push-token

Remove the user's push token (called on logout).

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Push token removed successfully"
}
```

**Behavior:**
- Clear the user's push token from the database
- This prevents notifications being sent to logged-out devices

---

## Sending Push Notifications

### Expo Push API

Send notifications via HTTP POST to Expo's push service:

**Endpoint:** `https://exp.host/--/api/v2/push/send`

**Request:**
```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Time for your injection! 💉",
  "body": "Pip is here to remind you it's injection day.",
  "data": {
    "type": "injection",
    "screen": "/(tabs)/injection"
  },
  "sound": "default",
  "priority": "high",
  "channelId": "injection-reminders"
}
```

**Response:**
```json
{
  "data": [
    {
      "status": "ok",
      "id": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
    }
  ]
}
```

### Batch Sending

For efficiency, send multiple notifications in a single request (up to 100):

```json
[
  {
    "to": "ExponentPushToken[user1token]",
    "title": "Injection reminder",
    "body": "..."
  },
  {
    "to": "ExponentPushToken[user2token]",
    "title": "Injection reminder",
    "body": "..."
  }
]
```

### Error Handling

Handle these error responses from Expo:

| Error Code | Meaning | Action |
|------------|---------|--------|
| `DeviceNotRegistered` | Token is invalid/expired | Remove token from database |
| `MessageTooBig` | Payload > 4096 bytes | Reduce message size |
| `MessageRateExceeded` | Too many messages | Implement rate limiting |
| `InvalidCredentials` | Bad Expo credentials | Check project configuration |

**Implementation:**
```javascript
async function sendPushNotification(token, notification) {
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      ...notification,
    }),
  });

  const result = await response.json();

  // Handle invalid tokens
  if (result.data?.[0]?.status === 'error') {
    if (result.data[0].details?.error === 'DeviceNotRegistered') {
      // Remove invalid token from database
      await removeUserPushToken(token);
    }
  }

  return result;
}
```

---

## Scheduled Notification Jobs

### Injection Reminders

Run daily at the time specified in user's `reminderTime` preference (default: 09:00).

**Logic:**
```javascript
async function sendInjectionReminders() {
  const today = new Date().getDay(); // 0=Sunday, 1=Monday, etc.

  // Find users whose injection day is today
  // API uses: 0=Monday, 1=Tuesday, ..., 6=Sunday
  // JavaScript: 0=Sunday, 1=Monday, ..., 6=Saturday
  const apiDayOfWeek = today === 0 ? 6 : today - 1;

  const users = await db.user.findMany({
    where: {
      injectionDay: apiDayOfWeek,
      expoPushToken: { not: null },
      notificationPreferences: {
        injectionReminder: true,
      },
    },
    include: {
      notificationPreferences: true,
      injections: {
        where: {
          date: {
            gte: startOfWeek(new Date()),
          },
        },
      },
    },
  });

  // Filter out users who already logged injection this week
  const usersToNotify = users.filter(u => u.injections.length === 0);

  // Send notifications
  for (const user of usersToNotify) {
    await sendPushNotification(user.expoPushToken, {
      title: "Time for your injection! 💉",
      body: "Pip is here to remind you it's injection day. You've got this!",
      data: { type: 'injection', screen: '/(tabs)/injection' },
      sound: 'default',
      channelId: 'injection-reminders',
    });
  }
}
```

### Weigh-in Reminders

Similar to injection reminders, same day by default.

```javascript
async function sendWeighInReminders() {
  // Same logic as injection, but check for weigh-ins this week
  // and use weighInReminder preference
}
```

### Daily Habit Reminders

Run daily at the time specified in user's `habitReminderTime` (default: 20:00).

```javascript
async function sendHabitReminders() {
  const users = await db.user.findMany({
    where: {
      expoPushToken: { not: null },
      notificationPreferences: {
        habitReminder: true,
      },
    },
    include: {
      notificationPreferences: true,
      dailyHabits: {
        where: {
          date: startOfDay(new Date()),
        },
      },
    },
  });

  // Filter to users who haven't completed all habits today
  const usersToNotify = users.filter(user => {
    const todayHabit = user.dailyHabits[0];
    if (!todayHabit) return true; // No habits logged
    return !(todayHabit.water && todayHabit.nutrition && todayHabit.exercise);
  });

  for (const user of usersToNotify) {
    await sendPushNotification(user.expoPushToken, {
      title: "Don't forget your habits! 🌟",
      body: "Have you logged your water, nutrition, and exercise today?",
      data: { type: 'habits', screen: '/(tabs)/check-in' },
      sound: 'default',
      channelId: 'habit-reminders',
    });
  }
}
```

---

## Cron Job Configuration

Schedule the notification jobs based on user timezones. For MVP, you can use a single timezone or the most common timezone among users.

**Example with node-cron:**
```javascript
const cron = require('node-cron');

// Injection & Weigh-in reminders at 9:00 AM UTC
cron.schedule('0 9 * * *', () => {
  sendInjectionReminders();
  sendWeighInReminders();
});

// Habit reminders at 8:00 PM UTC
cron.schedule('0 20 * * *', () => {
  sendHabitReminders();
});
```

**For proper timezone support:**
Consider running the job every hour and filtering users by their timezone:
```javascript
// Run every hour
cron.schedule('0 * * * *', async () => {
  const currentHour = new Date().getUTCHours();

  // Find users whose reminder time (in their timezone) matches current hour
  const users = await findUsersWithReminderAtHour(currentHour);
  // Send notifications...
});
```

---

## Android Notification Channels

The mobile app creates these notification channels:

| Channel ID | Name | Importance |
|------------|------|------------|
| `default` | Default | HIGH |
| `injection-reminders` | Injection Reminders | HIGH |
| `weighin-reminders` | Weigh-in Reminders | DEFAULT |
| `habit-reminders` | Daily Habit Reminders | DEFAULT |

Include `channelId` in push notifications for Android to route to the correct channel.

---

## Testing

### Test Endpoint (Optional)

Add an endpoint to send a test push notification:

**POST /api/notifications/test-push**

```json
{
  "type": "injection" | "weighin" | "habit"
}
```

This sends a test push notification to the authenticated user's registered device.

### Expo Push Notification Tool

Use Expo's web tool for testing: https://expo.dev/notifications

---

## Security Considerations

1. **Token Validation:** Always validate that tokens start with `ExponentPushToken[`
2. **User Authorization:** Only allow users to register/remove their own tokens
3. **Rate Limiting:** Implement rate limiting on the push-token endpoint
4. **Token Cleanup:** Periodically remove tokens that return `DeviceNotRegistered`

---

## Migration Checklist

- [ ] Add `expo_push_token` column to users table
- [ ] Add `push_token_platform` column to users table
- [ ] Add `push_token_updated_at` column to users table
- [ ] Implement `POST /api/users/push-token` endpoint
- [ ] Implement `DELETE /api/users/push-token` endpoint
- [ ] Create notification sender utility function
- [ ] Set up cron job for injection reminders
- [ ] Set up cron job for weigh-in reminders
- [ ] Set up cron job for habit reminders
- [ ] Add error handling for invalid tokens
- [ ] (Optional) Add test push endpoint

---

## Reference

- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push API Reference](https://docs.expo.dev/push-notifications/sending-notifications/)
- [Expo Push Notification Tool](https://expo.dev/notifications)
