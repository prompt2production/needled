'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { InjectionCardConnected } from '@/components/injection/InjectionCardConnected'
import { HabitsCard } from '@/components/habits/HabitsCard'
import { WeightProgressCard } from '@/components/dashboard/WeightProgressCard'
import { JourneyStatsCard } from '@/components/dashboard/JourneyStatsCard'
import type { DashboardResponse } from '@/lib/validations/dashboard'

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const MEDICATION_NAMES: Record<string, string> = {
  OZEMPIC: 'Ozempic',
  WEGOVY: 'Wegovy',
  MOUNJARO: 'Mounjaro',
  ZEPBOUND: 'Zepbound',
  OTHER: 'medication',
}

export default function HomePage() {
  const router = useRouter()
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    if (!storedUserId) {
      router.replace('/')
      return
    }

    setUserId(storedUserId)

    const fetchDashboard = async () => {
      try {
        const response = await fetch(`/api/dashboard?userId=${storedUserId}`)
        if (!response.ok) throw new Error('Failed to fetch dashboard')
        const data: DashboardResponse = await response.json()
        setDashboard(data)
      } catch (error) {
        console.error('Error fetching dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [router])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="px-6 py-6 max-w-5xl mx-auto">
          {/* Header skeleton */}
          <header className="mb-6">
            <div className="h-8 bg-white/5 rounded animate-pulse w-40 mb-2" />
            <div className="h-4 bg-white/5 rounded animate-pulse w-56" />
          </header>

          {/* Dashboard Grid skeleton */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <WeightProgressCard
                isLoading
                currentWeight={null}
                startWeight={0}
                totalLost={null}
                weekChange={null}
                progressPercent={null}
                weightUnit="kg"
                canWeighIn={false}
              />
              <div className="bg-card rounded-xl border border-border p-5 h-32 animate-pulse" />
            </div>
            <div className="space-y-6">
              <JourneyStatsCard
                isLoading
                weekNumber={0}
                weeklyHabitPercent={0}
                weighInCount={0}
              />
              <div className="bg-card rounded-xl border border-border p-5 h-64 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!dashboard || !userId) {
    return null
  }

  const { user, weight, habits, journey } = dashboard

  return (
    <main className="min-h-screen bg-background">
      <div className="px-6 py-6 max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-white">
            Hey, {user.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Let's check in on your journey
          </p>
        </header>

        {/* Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-6">
            <WeightProgressCard
              currentWeight={weight.currentWeight}
              startWeight={user.startWeight}
              totalLost={weight.totalLost}
              weekChange={weight.weekChange}
              progressPercent={weight.progressPercent}
              weightUnit={user.weightUnit}
              canWeighIn={weight.canWeighIn}
            />

            <InjectionCardConnected
              userId={userId}
              medicationName={MEDICATION_NAMES[user.medication] || 'medication'}
              injectionDayName={DAY_NAMES[user.injectionDay]}
            />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <JourneyStatsCard
              weekNumber={journey.weekNumber}
              weeklyHabitPercent={habits.weeklyCompletionPercent}
              weighInCount={weight.weighInCount}
            />

            <HabitsCard userId={userId} />
          </div>
        </div>
      </div>
    </main>
  )
}
