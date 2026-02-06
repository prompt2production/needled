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

// Max 51 = 50 standard doses + 1 golden dose
export const doseNumberSchema = z.number().int().min(1).max(51)

export const dosageMgSchema = z
  .number()
  .min(0.25, 'Dosage must be at least 0.25mg')
  .max(15, 'Dosage must be at most 15mg')

export const createInjectionSchema = z.object({
  site: injectionSiteEnum,
  doseNumber: doseNumberSchema.optional(),
  dosageMg: dosageMgSchema.optional(),
  isGoldenDose: z.boolean().optional().default(false),
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
  date: logDateSchema.optional(),
})

export type CreateInjectionInput = z.infer<typeof createInjectionSchema>

export const updateInjectionSchema = z.object({
  site: injectionSiteEnum.optional(),
  doseNumber: doseNumberSchema.optional(),
  dosageMg: dosageMgSchema.optional().nullable(),
  isGoldenDose: z.boolean().optional(),
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
  date: logDateSchema.optional(),
})

export type UpdateInjectionInput = z.infer<typeof updateInjectionSchema>
