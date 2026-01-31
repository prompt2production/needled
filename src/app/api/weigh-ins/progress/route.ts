import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/api-auth'

type RangeType = '1M' | '3M' | '6M' | 'ALL'

interface WeighInData {
  date: string
  weight: number
  dosageMg: number | null
}

interface DosageChange {
  date: string
  fromDosage: number | null
  toDosage: number
}

interface ProgressStats {
  totalChange: number
  percentChange: number
  currentBmi: number | null
  goalProgress: number | null
  toGoal: number | null
  weeklyAverage: number | null
}

interface ProgressResponse {
  weighIns: WeighInData[]
  dosageChanges: DosageChange[]
  stats: ProgressStats
}

function getRangeStartDate(range: RangeType): Date | null {
  if (range === 'ALL') return null

  const now = new Date()
  const days = {
    '1M': 30,
    '3M': 90,
    '6M': 180,
  }[range]

  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)
  return startDate
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = auth.user.id
    const { searchParams } = new URL(request.url)
    const range = (searchParams.get('range') || 'ALL') as RangeType

    // Validate range parameter
    if (!['1M', '3M', '6M', 'ALL'].includes(range)) {
      return NextResponse.json(
        { error: 'Invalid range. Must be 1M, 3M, 6M, or ALL' },
        { status: 400 }
      )
    }

    // Get user for goal weight and height
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        startWeight: true,
        goalWeight: true,
        height: true,
        weightUnit: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const rangeStartDate = getRangeStartDate(range)

    // Fetch weigh-ins within range
    const weighIns = await prisma.weighIn.findMany({
      where: {
        userId,
        ...(rangeStartDate && { date: { gte: rangeStartDate } }),
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        weight: true,
      },
    })

    // Fetch all injections with dosageMg to determine dosage at each weigh-in date
    // We need ALL injections (not just in range) to find the dosage that was active at each weigh-in
    const allInjectionsWithDosage = await prisma.injection.findMany({
      where: {
        userId,
        dosageMg: { not: null },
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        dosageMg: true,
      },
    })

    // Calculate dosage for each weigh-in
    // Find the most recent injection before or on the weigh-in date that has a dosageMg value
    const weighInsWithDosage: WeighInData[] = weighIns.map((weighIn) => {
      const weighInDate = weighIn.date

      // Find the most recent injection with dosage that's before or on this weigh-in date
      let dosageAtDate: number | null = null
      for (let i = allInjectionsWithDosage.length - 1; i >= 0; i--) {
        const injection = allInjectionsWithDosage[i]
        if (injection.date <= weighInDate && injection.dosageMg) {
          dosageAtDate = Number(injection.dosageMg)
          break
        }
      }

      return {
        date: weighIn.date.toISOString().split('T')[0],
        weight: weighIn.weight,
        dosageMg: dosageAtDate,
      }
    })

    // Calculate dosage changes from injections within range
    const injectionsInRange = rangeStartDate
      ? allInjectionsWithDosage.filter((inj) => inj.date >= rangeStartDate)
      : allInjectionsWithDosage

    const dosageChanges: DosageChange[] = []
    let lastDosage: number | null = null

    // Find the dosage before range start (if applicable) to properly track "fromDosage"
    if (rangeStartDate && allInjectionsWithDosage.length > 0) {
      for (let i = allInjectionsWithDosage.length - 1; i >= 0; i--) {
        const injection = allInjectionsWithDosage[i]
        if (injection.date < rangeStartDate && injection.dosageMg) {
          lastDosage = Number(injection.dosageMg)
          break
        }
      }
    }

    for (const injection of injectionsInRange) {
      const currentDosage = Number(injection.dosageMg)
      if (currentDosage !== lastDosage) {
        dosageChanges.push({
          date: injection.date.toISOString().split('T')[0],
          fromDosage: lastDosage,
          toDosage: currentDosage,
        })
        lastDosage = currentDosage
      }
    }

    // Calculate stats
    const stats = calculateStats(weighIns, user)

    const response: ProgressResponse = {
      weighIns: weighInsWithDosage,
      dosageChanges,
      stats,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch weight progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateStats(
  weighIns: { date: Date; weight: number }[],
  user: {
    startWeight: number
    goalWeight: number | null
    height: number | null
    weightUnit: string
  }
): ProgressStats {
  if (weighIns.length === 0) {
    return {
      totalChange: 0,
      percentChange: 0,
      currentBmi: null,
      goalProgress: null,
      toGoal: null,
      weeklyAverage: null,
    }
  }

  const firstWeighIn = weighIns[0]
  const lastWeighIn = weighIns[weighIns.length - 1]

  const firstWeight = firstWeighIn.weight
  const lastWeight = lastWeighIn.weight

  // Total change: lastWeight - firstWeight
  const totalChange = lastWeight - firstWeight

  // Percent change: ((lastWeight - firstWeight) / firstWeight) * 100
  const percentChange = (totalChange / firstWeight) * 100

  // Current BMI: weight(kg) / (height(m))^2
  let currentBmi: number | null = null
  if (user.height) {
    // Convert weight to kg if needed
    const weightInKg = user.weightUnit === 'lbs' ? lastWeight * 0.453592 : lastWeight
    const heightInMeters = user.height / 100
    currentBmi = weightInKg / (heightInMeters * heightInMeters)
    currentBmi = Math.round(currentBmi * 10) / 10 // Round to 1 decimal
  }

  // Goal progress: ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100
  let goalProgress: number | null = null
  let toGoal: number | null = null
  if (user.goalWeight != null) {
    const startWeight = user.startWeight
    const goalWeight = user.goalWeight
    const currentWeight = lastWeight

    // To goal: currentWeight - goalWeight
    toGoal = currentWeight - goalWeight
    toGoal = Math.round(toGoal * 10) / 10 // Round to 1 decimal

    // Goal progress as percentage
    const totalToLose = startWeight - goalWeight
    if (totalToLose > 0) {
      const actualLost = startWeight - currentWeight
      goalProgress = (actualLost / totalToLose) * 100
      goalProgress = Math.round(goalProgress * 10) / 10 // Round to 1 decimal
    }
  }

  // Weekly average: totalChange / numberOfWeeks
  let weeklyAverage: number | null = null
  const firstDate = firstWeighIn.date.getTime()
  const lastDate = lastWeighIn.date.getTime()
  const daysBetween = (lastDate - firstDate) / (1000 * 60 * 60 * 24)
  if (daysBetween >= 7) {
    const weeks = daysBetween / 7
    weeklyAverage = totalChange / weeks
    weeklyAverage = Math.round(weeklyAverage * 100) / 100 // Round to 2 decimals
  }

  return {
    totalChange: Math.round(totalChange * 10) / 10,
    percentChange: Math.round(percentChange * 100) / 100,
    currentBmi,
    goalProgress,
    toGoal,
    weeklyAverage,
  }
}
