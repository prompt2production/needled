'use client'

import { Calendar, CheckCircle, Scale } from 'lucide-react'

interface JourneyStatsCardProps {
  weekNumber: number
  weeklyHabitPercent: number
  weighInCount: number
  isLoading?: boolean
}

export function JourneyStatsCard({
  weekNumber,
  weeklyHabitPercent,
  weighInCount,
  isLoading = false,
}: JourneyStatsCardProps) {
  if (isLoading) {
    return <JourneyStatsCardSkeleton />
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-base font-medium text-white mb-4 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-lime" />
        Your Journey
      </h3>

      <div className="space-y-4">
        {/* Week number */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Week</span>
          <span className="text-lg font-semibold text-white">{weekNumber}</span>
        </div>

        {/* Habit completion */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Habits this week</span>
          </div>
          <span
            className={`text-lg font-semibold ${
              weeklyHabitPercent >= 80
                ? 'text-lime'
                : weeklyHabitPercent >= 50
                ? 'text-white'
                : 'text-muted-foreground'
            }`}
          >
            {weeklyHabitPercent}%
          </span>
        </div>

        {/* Total weigh-ins */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total weigh-ins</span>
          </div>
          <span className="text-lg font-semibold text-white">{weighInCount}</span>
        </div>
      </div>
    </div>
  )
}

function JourneyStatsCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="h-5 bg-white/5 rounded animate-pulse w-28 mb-4" />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-white/5 rounded animate-pulse w-16" />
          <div className="h-6 bg-white/5 rounded animate-pulse w-8" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-white/5 rounded animate-pulse w-28" />
          <div className="h-6 bg-white/5 rounded animate-pulse w-12" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-white/5 rounded animate-pulse w-24" />
          <div className="h-6 bg-white/5 rounded animate-pulse w-8" />
        </div>
      </div>
    </div>
  )
}
