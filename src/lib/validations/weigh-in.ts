import { z } from 'zod'
import { logDateSchema } from './log-date'

export const createWeighInSchema = z.object({
  weight: z
    .number()
    .positive('Weight must be a positive number')
    .min(40, 'Weight must be at least 40')
    .max(300, 'Weight must be at most 300'),
  date: logDateSchema.optional(),
})

export type CreateWeighInInput = z.infer<typeof createWeighInSchema>

export const updateWeighInSchema = z.object({
  weight: z
    .number()
    .positive('Weight must be a positive number')
    .min(40, 'Weight must be at least 40')
    .max(300, 'Weight must be at most 300')
    .optional(),
  date: logDateSchema.optional(),
})

export type UpdateWeighInInput = z.infer<typeof updateWeighInSchema>
