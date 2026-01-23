import { z } from 'zod'

export const MEDICATIONS = ['OZEMPIC', 'WEGOVY', 'MOUNJARO', 'ZEPBOUND', 'OTHER'] as const
export const WEIGHT_UNITS = ['kg', 'lbs'] as const

export const createUserSchema = z.object({
  name: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z.string().min(2, 'Name must be at least 2 characters').max(30, 'Name must be at most 30 characters')
    ),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  startWeight: z
    .number()
    .min(40, 'Weight must be at least 40')
    .max(300, 'Weight must be at most 300'),
  goalWeight: z
    .number()
    .min(40, 'Weight must be at least 40')
    .max(300, 'Weight must be at most 300')
    .optional()
    .nullable(),
  weightUnit: z.enum(WEIGHT_UNITS),
  medication: z.enum(MEDICATIONS),
  injectionDay: z
    .number()
    .int()
    .min(0, 'Injection day must be 0-6')
    .max(6, 'Injection day must be 0-6'),
}).refine(
  (data) => {
    if (data.goalWeight == null) return true
    return data.goalWeight < data.startWeight
  },
  {
    message: 'Goal weight must be less than starting weight',
    path: ['goalWeight'],
  }
)

export type CreateUserInput = z.infer<typeof createUserSchema>
