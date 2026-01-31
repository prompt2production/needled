import { z } from 'zod'

export const contactMessageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be 2000 characters or less'),
})

export type ContactMessageInput = z.infer<typeof contactMessageSchema>
