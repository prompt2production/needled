import { z } from 'zod'

export const MEDICATIONS = ['OZEMPIC', 'WEGOVY', 'MOUNJARO', 'ZEPBOUND', 'OTHER'] as const
export const WEIGHT_UNITS = ['kg', 'lbs'] as const

// Valid dosages per medication (in mg)
export const MEDICATION_DOSAGES: Record<string, number[]> = {
  OZEMPIC: [0.25, 0.5, 1, 2],
  WEGOVY: [0.25, 0.5, 1, 1.7, 2.4],
  MOUNJARO: [2.5, 5, 7.5, 10, 12.5, 15],
  ZEPBOUND: [2.5, 5, 7.5, 10, 12.5, 15],
  // OTHER has no dosage tracking
}

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
  startingDosage: z
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
