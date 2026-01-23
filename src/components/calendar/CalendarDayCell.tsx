'use client'

import { format, isToday } from 'date-fns'
import { Scale, Syringe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HabitData {
  water: boolean
  nutrition: boolean
  exercise: boolean
}

interface CalendarDayCellProps {
  date: Date
  habit?: HabitData | null
  hasWeighIn?: boolean
  hasInjection?: boolean
  onClick?: () => void
}

export function CalendarDayCell({
  date,
  habit,
  hasWeighIn,
  hasInjection,
  onClick,
}: CalendarDayCellProps) {
  const dayNumber = format(date, 'd')
  const isCurrentDay = isToday(date)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full aspect-square flex flex-col items-center justify-center p-1 rounded-lg transition-colors',
        'hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-lime/50',
        isCurrentDay && 'ring-1 ring-lime/30'
      )}
    >
      {/* Day number */}
      <span
        className={cn(
          'text-sm font-medium',
          isCurrentDay ? 'text-lime' : 'text-white'
        )}
      >
        {dayNumber}
      </span>

      {/* Habit dots */}
      {habit && (
        <div className="flex gap-0.5 mt-1">
          <div
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              habit.water ? 'bg-lime' : 'bg-white/20'
            )}
          />
          <div
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              habit.nutrition ? 'bg-lime' : 'bg-white/20'
            )}
          />
          <div
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              habit.exercise ? 'bg-lime' : 'bg-white/20'
            )}
          />
        </div>
      )}

      {/* Icons row */}
      <div className="flex gap-1 mt-0.5 h-3">
        {hasWeighIn && <Scale className="h-3 w-3 text-muted-foreground" />}
        {hasInjection && <Syringe className="h-3 w-3 text-lime" />}
      </div>
    </button>
  )
}
