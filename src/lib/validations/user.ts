import { z } from 'zod'
import { DOSING_MODES } from './pen-dosing'

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
  // Pen dosing fields
  dosingMode: z.enum(DOSING_MODES).optional(),
  penStrengthMg: z
    .number()
    .min(0.5, 'Pen strength must be at least 0.5mg')
    .max(100, 'Pen strength must be at most 100mg')
    .optional()
    .nullable(),
  doseAmountMg: z
    .number()
    .min(0.1, 'Dose amount must be at least 0.1mg')
    .max(50, 'Dose amount must be at most 50mg')
    .optional()
    .nullable(),
  dosesPerPen: z
    .number()
    .int()
    .min(1, 'Doses per pen must be at least 1')
    .max(50, 'Doses per pen must be at most 50')
    .optional(),
  tracksGoldenDose: z.boolean().optional(),
  currentDoseInPen: z
    .number()
    .int()
    .min(1, 'Current dose must be at least 1')
    .optional(),
}).refine(
  (data) => {
    if (data.goalWeight == null) return true
    return data.goalWeight < data.startWeight
  },
  {
    message: 'Goal weight must be less than starting weight',
    path: ['goalWeight'],
  }
).refine(
  (data) => {
    // If microdose mode, require penStrengthMg and doseAmountMg
    if (data.dosingMode === 'MICRODOSE') {
      return data.penStrengthMg != null && data.doseAmountMg != null
    }
    return true
  },
  {
    message: 'Microdose mode requires pen strength and dose amount',
    path: ['dosingMode'],
  }
)

export type CreateUserInput = z.infer<typeof createUserSchema>
