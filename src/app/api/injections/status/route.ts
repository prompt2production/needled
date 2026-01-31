import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getInjectionWeekStart, getInjectionWeekEnd, isInjectionDay, getDaysUntilInjection, getDaysOverdue } from '@/lib/injection-week'
import { getNextSite } from '@/lib/injection-site'
import { getNextDoseNumber } from '@/lib/dose-tracking'
import { authenticateRequest } from '@/lib/api-auth'
import type { InjectionSite } from '@/lib/validations/injection'

export type InjectionStatus = 'due' | 'done' | 'overdue' | 'upcoming'

export interface InjectionStatusResponse {
  status: InjectionStatus
  daysUntil: number
  daysOverdue: number
  lastInjection: {
    id: string
    site: string
    doseNumber: number
    dosageMg: number | null
    date: string
    notes: string | null
  } | null
  suggestedSite: InjectionSite
  currentDose: number | null
  nextDose: number
  dosesRemaining: number
  currentDosageMg: number | null
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = auth.user.id

    // Get user to find their injection day
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const now = new Date()
    const weekStart = getInjectionWeekStart(now, user.injectionDay)
    const weekEnd = getInjectionWeekEnd(now, user.injectionDay)

    // Check if injection already logged this week
    const thisWeekInjection = await prisma.injection.findFirst({
      where: {
        userId,
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      orderBy: { date: 'desc' },
    })

    // Get the most recent injection (for site rotation)
    const lastInjection = await prisma.injection.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    })

    // Calculate suggested site
    const lastSite = lastInjection?.site as InjectionSite | undefined
    const suggestedSite = getNextSite(lastSite ?? null)

    // Calculate days until/overdue
    const daysUntil = getDaysUntilInjection(now, user.injectionDay)
    const daysOverdueValue = getDaysOverdue(now, user.injectionDay)

    // Determine status based on calendar position relative to injection day
    // Use daysOverdue to check if we're past injection day in the calendar week
    // daysOverdue = 0 means we're on injection day
    // daysOverdue > 0 means we're past injection day (1 = Thursday if injection is Wednesday)
    // daysUntil > 0 && daysOverdue > 0 is impossible - one is always 0
    // When before injection day: daysUntil > 0, daysOverdue > 0 (days since LAST injection day)
    // The key insight: daysUntil + daysOverdue = 7 when not on injection day
    // If daysUntil < daysOverdue, we're closer to next injection (upcoming)
    // If daysOverdue <= daysUntil, we're closer to last injection (overdue)
    let status: InjectionStatus
    if (thisWeekInjection) {
      status = 'done'
    } else if (isInjectionDay(now, user.injectionDay)) {
      status = 'due'
    } else if (daysUntil <= daysOverdueValue) {
      // We're closer to or equidistant from next injection day - upcoming
      status = 'upcoming'
    } else {
      // We're closer to the last injection day - overdue
      status = 'overdue'
    }

    // Calculate dose tracking fields
    const currentDose = lastInjection?.doseNumber ?? null
    const nextDose = getNextDoseNumber(currentDose)
    // Doses remaining: if on dose 4, still show 4 remaining (new pen) since dose 4 was used
    // Otherwise show 4 - currentDose
    const dosesRemaining = currentDose === null ? 4 : (currentDose === 4 ? 4 : 4 - currentDose)

    const response: InjectionStatusResponse = {
      status,
      daysUntil: status === 'done' || status === 'due' || status === 'overdue' ? 0 : daysUntil,
      daysOverdue: status === 'overdue' ? daysOverdueValue : 0,
      lastInjection: lastInjection ? {
        id: lastInjection.id,
        site: lastInjection.site,
        doseNumber: lastInjection.doseNumber,
        dosageMg: lastInjection.dosageMg ? Number(lastInjection.dosageMg) : null,
        date: lastInjection.date.toISOString(),
        notes: lastInjection.notes,
      } : null,
      suggestedSite,
      currentDose,
      nextDose,
      dosesRemaining,
      currentDosageMg: user.currentDosage ? Number(user.currentDosage) : null,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch injection status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
