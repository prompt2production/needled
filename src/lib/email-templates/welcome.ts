interface WelcomeEmailParams {
  userName: string
  medication: string
  injectionDay: string
  unsubscribeUrl: string
}

export function renderWelcomeEmail({ userName, medication, injectionDay, unsubscribeUrl }: WelcomeEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Needled</title>
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
                Welcome to Needled, ${userName}!
              </h1>
              <p style="color: #737373; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
                You're all set up and ready to start tracking your ${medication} journey. We'll help you stay consistent with your injections, build healthy habits, and celebrate your progress.
              </p>

              <!-- Quick Start Section -->
              <div style="background-color: #1A1A1A; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h2 style="color: #BFFF00; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
                  Your schedule
                </h2>
                <p style="color: #FFFFFF; font-size: 14px; line-height: 20px; margin: 0;">
                  Injection day: <strong style="color: #BFFF00;">${injectionDay}</strong>
                </p>
                <p style="color: #737373; font-size: 14px; line-height: 20px; margin: 8px 0 0 0;">
                  We'll send you a reminder on your injection day so you never miss a dose.
                </p>
              </div>

              <!-- Tips Section -->
              <h2 style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
                Tips for success
              </h2>
              <ul style="color: #737373; font-size: 14px; line-height: 22px; margin: 0 0 24px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Log your injection immediately after taking it</li>
                <li style="margin-bottom: 8px;">Weigh in weekly on the same day for accurate tracking</li>
                <li style="margin-bottom: 8px;">Check in daily with your three habits: water, nutrition, movement</li>
              </ul>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #BFFF00; border-radius: 8px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://needled.app'}"
                       style="display: inline-block; padding: 14px 28px; color: #000000; font-size: 16px; font-weight: 600; text-decoration: none;">
                      Open Needled
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
                You're receiving this because you signed up for Needled.
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

export function getWelcomeEmailSubject(userName: string): string {
  return `Welcome to Needled, ${userName}!`
}
