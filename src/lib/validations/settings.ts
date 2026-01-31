import { z } from 'zod'
import { MEDICATIONS } from './user'

/**
 * Schema for updating user profile settings
 * Allows updating name, goalWeight, medication, injectionDay, currentDosage, and height
 */
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z.string().min(2, 'Name must be at least 2 characters').max(30, 'Name must be at most 30 characters')
    ),
  goalWeight: z
    .number()
    .min(40, 'Weight must be at least 40')
    .max(300, 'Weight must be at most 300')
    .optional()
    .nullable(),
  medication: z.enum(MEDICATIONS),
  injectionDay: z
    .number()
    .int()
    .min(0, 'Injection day must be 0-6')
    .max(6, 'Injection day must be 0-6'),
  currentDosage: z
    .number()
    .min(0.25, 'Dosage must be at least 0.25mg')
    .max(15, 'Dosage must be at most 15mg')
    .optional()
    .nullable(),
  height: z
    .number()
    .int()
    .min(100, 'Height must be at least 100cm')
    .max(250, 'Height must be at most 250cm')
    .optional()
    .nullable(),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

/**
 * Schema for updating email address
 */
export const emailUpdateSchema = z.object({
  email: z.string().email('Invalid email format'),
})

export type EmailUpdateInput = z.infer<typeof emailUpdateSchema>

/**
 * Schema for changing password
 * Requires current password and new password with confirmation
 */
export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
)

export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>

/**
 * Schema for account deletion confirmation
 * Requires password to confirm deletion
 */
export const accountDeleteSchema = z.object({
  password: z.string().min(1, 'Password is required to delete account'),
})

export type AccountDeleteInput = z.infer<typeof accountDeleteSchema>
