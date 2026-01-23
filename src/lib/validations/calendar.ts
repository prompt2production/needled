import { z } from 'zod'

// Calendar month params validation
export const calendarMonthParamsSchema = z.object({
  year: z.coerce.number().int().min(1900).max(2100),
  month: z.coerce.number().int().min(1).max(12),
})

export type CalendarMonthParams = z.infer<typeof calendarMonthParamsSchema>

// Calendar day params validation
export const calendarDayParamsSchema = z.object({
  date: z.string().refine((val) => {
    const date = new Date(val)
    return !isNaN(date.getTime())
  }, 'Invalid ISO date string'),
})

export type CalendarDayParams = z.infer<typeof calendarDayParamsSchema>

// Calendar month response types
export interface CalendarHabitEntry {
  date: string
  water: boolean
  nutrition: boolean
  exercise: boolean
}

export interface CalendarWeighInEntry {
  date: string
  weight: number
}

export interface CalendarInjectionEntry {
  date: string
  site: string
}

export interface CalendarMonthResponse {
  habits: CalendarHabitEntry[]
  weighIns: CalendarWeighInEntry[]
  injections: CalendarInjectionEntry[]
}

export const calendarMonthResponseSchema = z.object({
  habits: z.array(z.object({
    date: z.string(),
    water: z.boolean(),
    nutrition: z.boolean(),
    exercise: z.boolean(),
  })),
  weighIns: z.array(z.object({
    date: z.string(),
    weight: z.number(),
  })),
  injections: z.array(z.object({
    date: z.string(),
    site: z.string(),
  })),
})

// Calendar day response types
export interface CalendarDayHabit {
  water: boolean
  nutrition: boolean
  exercise: boolean
}

export interface CalendarDayWeighIn {
  weight: number
  change: number | null
}

export interface CalendarDayInjection {
  site: string
}

export interface CalendarDayResponse {
  date: string
  habit: CalendarDayHabit | null
  weighIn: CalendarDayWeighIn | null
  injection: CalendarDayInjection | null
}

export const calendarDayResponseSchema = z.object({
  date: z.string(),
  habit: z.object({
    water: z.boolean(),
    nutrition: z.boolean(),
    exercise: z.boolean(),
  }).nullable(),
  weighIn: z.object({
    weight: z.number(),
    change: z.number().nullable(),
  }).nullable(),
  injection: z.object({
    site: z.string(),
  }).nullable(),
})
