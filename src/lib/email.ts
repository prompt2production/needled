import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key
const apiKey = process.env.SENDGRID_API_KEY
if (apiKey) {
  sgMail.setApiKey(apiKey)
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

/**
 * Send an email using SendGrid
 * @returns true if email sent successfully, false otherwise
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL

  if (!apiKey) {
    console.error('SENDGRID_API_KEY environment variable is not set')
    return false
  }

  if (!fromEmail) {
    console.error('SENDGRID_FROM_EMAIL environment variable is not set')
    return false
  }

  try {
    await sgMail.send({
      to,
      from: fromEmail,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}
