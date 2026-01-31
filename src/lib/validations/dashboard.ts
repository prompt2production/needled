import { z } from 'zod'

// Dashboard no longer requires userId in query params - it's derived from authenticated session
export const dashboardQuerySchema = z.object({})

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>

export interface DashboardResponse {
  user: {
    id: string
    name: string
    startWeight: number
    goalWeight: number | null
    weightUnit: string
    medication: string
    injectionDay: number
    createdAt: string
  }
  weight: {
    currentWeight: number | null
    previousWeight: number | null
    weekChange: number | null
    totalLost: number | null
    progressPercent: number | null
    weighInCount: number
    canWeighIn: boolean
  }
  habits: {
    weeklyCompletionPercent: number
    todayCompleted: number
    todayTotal: number
  }
  journey: {
    weekNumber: number
    startDate: string
  }
}
