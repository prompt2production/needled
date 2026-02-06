import { z } from 'zod'

export const DOSING_MODES = ['STANDARD', 'MICRODOSE'] as const

export const penDosingSchema = z.object({
  dosingMode: z.enum(DOSING_MODES),
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
  tracksGoldenDose: z.boolean(),
  currentDoseInPen: z
    .number()
    .int()
    .min(1, 'Current dose must be at least 1')
    .optional(),
}).refine(
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

export type PenDosingInput = z.infer<typeof penDosingSchema>

// Schema for updating pen dosing settings (all fields optional except dosingMode)
export const updatePenDosingSchema = z.object({
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
    // If switching to microdose mode, require penStrengthMg and doseAmountMg
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

export type UpdatePenDosingInput = z.infer<typeof updatePenDosingSchema>
