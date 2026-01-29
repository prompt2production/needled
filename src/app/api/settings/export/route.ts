import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/api-auth'
import { format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Fetch all user data
    const fullUserData = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        startWeight: true,
        goalWeight: true,
        weightUnit: true,
        medication: true,
        injectionDay: true,
        createdAt: true,
        updatedAt: true,
        // Explicitly NOT selecting passwordHash
        weighIns: {
          select: {
            id: true,
            weight: true,
            date: true,
            createdAt: true,
          },
          orderBy: { date: 'desc' },
        },
        injections: {
          select: {
            id: true,
            date: true,
            site: true,
            notes: true,
            createdAt: true,
          },
          orderBy: { date: 'desc' },
        },
        dailyHabits: {
          select: {
            id: true,
            date: true,
            water: true,
            nutrition: true,
            exercise: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { date: 'desc' },
        },
        notificationPreference: {
          select: {
            injectionReminder: true,
            weighInReminder: true,
            habitReminder: true,
            reminderTime: true,
            habitReminderTime: true,
            timezone: true,
          },
        },
        // NOT including sessions (sensitive auth data)
      },
    })

    if (!fullUserData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0',
      user: {
        profile: {
          id: fullUserData.id,
          name: fullUserData.name,
          email: fullUserData.email,
          startWeight: fullUserData.startWeight,
          goalWeight: fullUserData.goalWeight,
          weightUnit: fullUserData.weightUnit,
          medication: fullUserData.medication,
          injectionDay: fullUserData.injectionDay,
          createdAt: fullUserData.createdAt,
          updatedAt: fullUserData.updatedAt,
        },
        notificationPreferences: fullUserData.notificationPreference,
      },
      weighIns: fullUserData.weighIns,
      injections: fullUserData.injections,
      dailyHabits: fullUserData.dailyHabits,
    }

    const filename = `needled-export-${format(new Date(), 'yyyy-MM-dd')}.json`

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
