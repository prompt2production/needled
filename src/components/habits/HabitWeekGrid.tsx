'use client'

import { HabitIndicator, type HabitIndicatorState } from './HabitIndicator'
import { getDateString, isToday, isFuture, isPast } from '@/lib/habit-dates'
import type { HabitType } from '@/lib/validations/habit'
import type { LucideIcon } from 'lucide-react'

interface WeekData {
  date: string
  completed: boolean
}

interface HabitWeekGridProps {
  habit: HabitType
  label: string
  icon: LucideIcon
  weekData: WeekData[]
  today: string
  onToggle: (habit: HabitType, value: boolean, date: string) => void
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function HabitWeekGrid({
  habit,
  label,
  icon: Icon,
  weekData,
  today,
  onToggle,
}: HabitWeekGridProps) {
  // Create a map for quick lookup
  const completionMap = new Map<string, boolean>()
  for (const data of weekData) {
    completionMap.set(data.date, data.completed)
  }

  // Get state for each day
  const getDayState = (dateString: string, completed: boolean): HabitIndicatorState => {
    if (completed) return 'completed'

    const date = new Date(dateString)
    if (isToday(date)) return 'today'
    if (isFuture(date)) return 'future'
    if (isPast(date)) return 'past'

    return 'today' // Fallback
  }

  return (
    <div className="flex items-center gap-3">
      {/* Icon and label */}
      <div className="flex items-center gap-2 w-24 shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>

      {/* Day indicators */}
      <div className="flex gap-2">
        {weekData.map((data, index) => {
          const isCompleted = completionMap.get(data.date) ?? false
          const state = getDayState(data.date, isCompleted)
          const date = new Date(data.date)
          const canToggle = !isFuture(date) // Can toggle today and past days

          return (
            <HabitIndicator
              key={data.date}
              state={state}
              label={DAY_LABELS[index]}
              onClick={
                canToggle
                  ? () => onToggle(habit, !isCompleted, data.date)
                  : undefined
              }
            />
          )
        })}
      </div>
    </div>
  )
}
