import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getInjectionWeekStart, getInjectionWeekEnd, isInjectionDay, getDaysUntilInjection, getDaysOverdue } from '@/lib/injection-week'
import { getNextSite } from '@/lib/injection-site'
import { getNextDoseNumber, getStandardDosesRemaining, isGoldenDoseAvailable, isOnGoldenDose, type DoseTrackingConfig } from '@/lib/dose-tracking'
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
    isGoldenDose: boolean
  } | null
  suggestedSite: InjectionSite
  currentDose: number | null
  nextDose: number
  dosesRemaining: number
  currentDosageMg: number | null
  // Pen tracking fields
  dosesPerPen: number
  tracksGoldenDose: boolean
  isGoldenDoseAvailable: boolean
  isOnGoldenDose: boolean
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
    const daysUntilValue = getDaysUntilInjection(now, user.injectionDay)
    const daysOverdueValue = getDaysOverdue(now, user.injectionDay)

    // Determine status based on calendar position and injection history
    let status: InjectionStatus
    if (thisWeekInjection) {
      status = 'done'
    } else if (isInjectionDay(now, user.injectionDay)) {
      status = 'due'
    } else if (!lastInjection) {
      // New user with no injection history - can't be overdue
      // They're always "upcoming" until their injection day
      status = 'upcoming'
    } else if (daysUntilValue <= daysOverdueValue) {
      // User with history - closer to or equidistant from next injection day
      status = 'upcoming'
    } else {
      // User with history - past injection day without logging
      status = 'overdue'
    }

    // Build dose tracking config from user settings
    const doseConfig: DoseTrackingConfig = {
      dosesPerPen: user.dosesPerPen,
      tracksGoldenDose: user.tracksGoldenDose,
      wasGoldenDose: lastInjection?.isGoldenDose ?? false,
    }

    // Calculate dose tracking fields using user's pen configuration
    const currentDose = lastInjection?.doseNumber ?? null

    // For new users (no injection history), use their registered currentDoseInPen
    // For existing users, calculate from last injection
    let nextDose: number
    if (!lastInjection) {
      // New user - use their registration value
      nextDose = user.currentDoseInPen
    } else {
      // Existing user - calculate from last injection
      nextDose = getNextDoseNumber(currentDose, doseConfig)
    }

    // Calculate remaining standard doses based on nextDose
    const dosesRemainingValue = getStandardDosesRemaining(nextDose, user.dosesPerPen)

    // For golden dose checks, consider both last injection and new user position
    // A new user at golden dose position (currentDoseInPen > dosesPerPen) is on golden dose
    const isNewUserOnGoldenDose = !lastInjection && user.currentDoseInPen > user.dosesPerPen
    const goldenDoseAvailable = user.tracksGoldenDose && (
      isGoldenDoseAvailable(currentDose, doseConfig) || isNewUserOnGoldenDose
    )
    const onGoldenDose = isOnGoldenDose(currentDose, doseConfig) || isNewUserOnGoldenDose

    // Calculate daysUntil based on status
    // - 'upcoming': positive days until injection day
    // - 'due' or 'done': 0
    // - 'overdue': negative days (e.g., -1 means 1 day past due)
    let daysUntil: number
    if (status === 'overdue') {
      daysUntil = -daysOverdueValue
    } else if (status === 'upcoming') {
      daysUntil = daysUntilValue
    } else {
      daysUntil = 0
    }

    const response: InjectionStatusResponse = {
      status,
      daysUntil,
      daysOverdue: status === 'overdue' ? daysOverdueValue : 0,
      lastInjection: lastInjection ? {
        id: lastInjection.id,
        site: lastInjection.site,
        doseNumber: lastInjection.doseNumber,
        dosageMg: lastInjection.dosageMg ? Number(lastInjection.dosageMg) : null,
        date: lastInjection.date.toISOString(),
        notes: lastInjection.notes,
        isGoldenDose: lastInjection.isGoldenDose,
      } : null,
      suggestedSite,
      currentDose,
      nextDose,
      dosesRemaining: dosesRemainingValue,
      currentDosageMg: user.currentDosage ? Number(user.currentDosage) : null,
      // Pen tracking fields
      dosesPerPen: user.dosesPerPen,
      tracksGoldenDose: user.tracksGoldenDose,
      isGoldenDoseAvailable: goldenDoseAvailable,
      isOnGoldenDose: onGoldenDose,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch injection status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
