import { z } from 'zod'

export const pushTokenInputSchema = z.object({
  token: z
    .string()
    .min(1, 'Token is required')
    .refine(
      (token) => token.startsWith('ExponentPushToken['),
      'Invalid push token format. Must start with ExponentPushToken['
    ),
  platform: z.enum(['ios', 'android'], {
    errorMap: () => ({ message: 'Platform must be ios or android' }),
  }),
})

export type PushTokenInput = z.infer<typeof pushTokenInputSchema>
