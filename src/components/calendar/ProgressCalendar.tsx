'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { CalendarHeader } from './CalendarHeader'
import { CalendarGrid } from './CalendarGrid'
import { CalendarDayCell } from './CalendarDayCell'
import { DayDetailDialog } from './DayDetailDialog'
import { StreakSummary } from './StreakSummary'
import { useCalendarMonth } from '@/hooks/useCalendarMonth'
import { calculateStreaks } from '@/lib/streak-utils'

interface ProgressCalendarProps {
  userId: string
}

export function ProgressCalendar({ userId }: ProgressCalendarProps) {
  // Current date - memoized to avoid recreating on every render
  const today = useMemo(() => new Date(), [])

  // Current month state
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  // Selected day for dialog
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Check if viewing current month
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1

  // Fetch calendar data
  const { data, loading, error } = useCalendarMonth(year, month, userId)

  // Create lookup maps for efficient rendering
  const habitMap = useMemo(() => {
    const map = new Map<
      string,
      { water: boolean; nutrition: boolean; exercise: boolean }
    >()
    if (data?.habits) {
      for (const habit of data.habits) {
        map.set(habit.date, {
          water: habit.water,
          nutrition: habit.nutrition,
          exercise: habit.exercise,
        })
      }
    }
    return map
  }, [data?.habits])

  const weighInMap = useMemo(() => {
    const map = new Map<string, boolean>()
    if (data?.weighIns) {
      for (const weighIn of data.weighIns) {
        map.set(weighIn.date, true)
      }
    }
    return map
  }, [data?.weighIns])

  const injectionMap = useMemo(() => {
    const map = new Map<string, boolean>()
    if (data?.injections) {
      for (const injection of data.injections) {
        map.set(injection.date, true)
      }
    }
    return map
  }, [data?.injections])

  // Calculate streak information
  const streakInfo = useMemo(() => {
    return calculateStreaks(habitMap, today)
  }, [habitMap, today])

  const handleNavigate = (newYear: number, newMonth: number) => {
    setYear(newYear)
    setMonth(newMonth)
  }

  const handleDayClick = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    setSelectedDate(dateString)
    setDialogOpen(true)
  }

  const renderDay = (date: Date, isCurrentMonth: boolean) => {
    const dateString = format(date, 'yyyy-MM-dd')
    const habit = habitMap.get(dateString)
    const hasWeighIn = weighInMap.get(dateString) ?? false
    const hasInjection = injectionMap.get(dateString) ?? false
    const streakDayNumber = streakInfo.streakDayNumbers.get(dateString)

    return (
      <CalendarDayCell
        date={date}
        habit={habit}
        hasWeighIn={hasWeighIn}
        hasInjection={hasInjection}
        streakDayNumber={streakDayNumber}
        onClick={() => handleDayClick(date)}
      />
    )
  }

  return (
    <div className="w-full">
      <CalendarHeader
        year={year}
        month={month}
        onNavigate={handleNavigate}
        isCurrentMonth={isCurrentMonth}
      />

      {!loading && !error && (
        <StreakSummary
          currentStreak={streakInfo.currentStreak}
          bestStreak={streakInfo.bestStreak}
        />
      )}

      {loading && (
        <div className="space-y-1">
          {/* Day headers skeleton */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-6 bg-white/5 rounded animate-pulse"
              />
            ))}
          </div>
          {/* Calendar grid skeleton */}
          {Array.from({ length: 5 }).map((_, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => (
                <div
                  key={dayIndex}
                  className="aspect-square bg-white/5 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-400 text-sm">Failed to load calendar data</p>
        </div>
      )}

      {!loading && !error && (
        <CalendarGrid year={year} month={month} renderDay={renderDay} />
      )}

      <DayDetailDialog
        date={selectedDate}
        userId={userId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
