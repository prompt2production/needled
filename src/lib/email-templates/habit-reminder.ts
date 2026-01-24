interface HabitReminderParams {
  userName: string
  unsubscribeUrl: string
}

export function renderHabitReminder({ userName, unsubscribeUrl }: HabitReminderParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Habit Check-In</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #050505;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" max-width="480px" cellspacing="0" cellpadding="0" style="max-width: 480px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <span style="color: #BFFF00; font-size: 24px; font-weight: 600;">Needled</span>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td style="background-color: #0F0F0F; border-radius: 16px; padding: 32px;">
              <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">
                Time to check in on your habits
              </h1>
              <p style="color: #737373; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                Hey ${userName}, have you checked in on your daily habits yet?
              </p>
              <p style="color: #737373; font-size: 14px; line-height: 22px; margin: 0 0 24px 0;">
                Take a moment to log how you did with:
              </p>
              <ul style="color: #737373; font-size: 14px; line-height: 24px; margin: 0 0 24px 20px; padding: 0;">
                <li style="margin-bottom: 8px;"><span style="color: #BFFF00;">Water</span> - Did you stay hydrated?</li>
                <li style="margin-bottom: 8px;"><span style="color: #BFFF00;">Nutrition</span> - Did you eat well?</li>
                <li><span style="color: #BFFF00;">Exercise</span> - Did you move your body?</li>
              </ul>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #BFFF00; border-radius: 8px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/habits"
                       style="display: inline-block; padding: 14px 28px; color: #000000; font-size: 16px; font-weight: 600; text-decoration: none;">
                      Check In Now
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="color: #737373; font-size: 12px; margin: 0;">
                You're receiving this because you signed up for daily habit reminders on Needled.
              </p>
              <p style="color: #737373; font-size: 12px; margin: 8px 0 0 0;">
                <a href="${unsubscribeUrl}" style="color: #737373; text-decoration: underline;">Unsubscribe from all emails</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()
}

export function getHabitReminderSubject(): string {
  return "Have you logged your habits today?"
}
