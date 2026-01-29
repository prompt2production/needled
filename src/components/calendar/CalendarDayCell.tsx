'use client'

import { format, isToday } from 'date-fns'
import { Scale, Syringe, Droplets, Utensils, Dumbbell, Flame } from 'lucide-react'
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
  streakDayNumber?: number
  onClick?: () => void
}

export function CalendarDayCell({
  date,
  habit,
  hasWeighIn,
  hasInjection,
  streakDayNumber,
  onClick,
}: CalendarDayCellProps) {
  const dayNumber = format(date, 'd')
  const isCurrentDay = isToday(date)
  const isStreakDay = streakDayNumber !== undefined && streakDayNumber >= 1

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full aspect-square flex flex-col items-center justify-center p-1 rounded-lg transition-colors',
        'hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-lime/50',
        isCurrentDay && 'ring-1 ring-lime/30',
        isStreakDay && 'bg-lime/5'
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

      {/* Habit section - show flame for streak days, icons otherwise */}
      {habit && (
        <>
          {isStreakDay ? (
            /* Streak day: show flame with day number */
            <div className="flex items-center gap-1 mt-1.5">
              <Flame className="h-5 w-5 text-lime" />
              <span className="text-xs font-medium text-lime">{streakDayNumber}</span>
            </div>
          ) : (
            /* Non-streak day: show individual habit icons */
            <div className="flex gap-1.5 mt-1.5">
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center',
                  habit.water ? 'bg-lime/20' : 'bg-white/5'
                )}
              >
                <Droplets
                  className={cn(
                    'h-3.5 w-3.5',
                    habit.water ? 'text-lime' : 'text-white/30'
                  )}
                />
              </div>
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center',
                  habit.nutrition ? 'bg-lime/20' : 'bg-white/5'
                )}
              >
                <Utensils
                  className={cn(
                    'h-3.5 w-3.5',
                    habit.nutrition ? 'text-lime' : 'text-white/30'
                  )}
                />
              </div>
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center',
                  habit.exercise ? 'bg-lime/20' : 'bg-white/5'
                )}
              >
                <Dumbbell
                  className={cn(
                    'h-3.5 w-3.5',
                    habit.exercise ? 'text-lime' : 'text-white/30'
                  )}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Icons row */}
      <div className="flex gap-1.5 mt-1">
        {hasWeighIn && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/10">
            <Scale className="h-3.5 w-3.5 text-white" />
          </div>
        )}
        {hasInjection && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-lime/20">
            <Syringe className="h-3.5 w-3.5 text-lime" />
          </div>
        )}
      </div>
    </button>
  )
}
