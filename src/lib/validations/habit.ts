import { z } from 'zod'

export const habitTypeEnum = z.enum(['water', 'nutrition', 'exercise'])

export type HabitType = z.infer<typeof habitTypeEnum>

export const toggleHabitSchema = z.object({
  habit: habitTypeEnum,
  value: z.boolean(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
})

export type ToggleHabitInput = z.infer<typeof toggleHabitSchema>

export const getHabitsSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
})

export type GetHabitsInput = z.infer<typeof getHabitsSchema>
