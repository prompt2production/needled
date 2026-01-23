import { z } from 'zod'

/**
 * Schema for login validation
 * Password just needs to exist (min 1 char) - validation was done at registration
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Schema for registration validation
 * Password requires minimum 8 characters
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type RegisterInput = z.infer<typeof registerSchema>
