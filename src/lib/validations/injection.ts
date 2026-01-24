import { z } from 'zod'
import { logDateSchema } from './log-date'

export const injectionSiteEnum = z.enum([
  'ABDOMEN_LEFT',
  'ABDOMEN_RIGHT',
  'THIGH_LEFT',
  'THIGH_RIGHT',
  'UPPER_ARM_LEFT',
  'UPPER_ARM_RIGHT',
])

export type InjectionSite = z.infer<typeof injectionSiteEnum>

export const doseNumberSchema = z.number().int().min(1).max(4)

export const createInjectionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  site: injectionSiteEnum,
  doseNumber: doseNumberSchema.optional(),
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
  date: logDateSchema.optional(),
})

export type CreateInjectionInput = z.infer<typeof createInjectionSchema>

export const updateInjectionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  site: injectionSiteEnum.optional(),
  doseNumber: doseNumberSchema.optional(),
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
  date: logDateSchema.optional(),
})

export type UpdateInjectionInput = z.infer<typeof updateInjectionSchema>
