import { z } from 'zod'

export const createWeighInSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  weight: z
    .number()
    .positive('Weight must be a positive number')
    .min(40, 'Weight must be at least 40')
    .max(300, 'Weight must be at most 300'),
})

export type CreateWeighInInput = z.infer<typeof createWeighInSchema>
