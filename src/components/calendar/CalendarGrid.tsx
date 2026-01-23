'use client'

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  format,
} from 'date-fns'
import { ReactNode } from 'react'

const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

interface CalendarGridProps {
  year: number
  month: number
  renderDay: (date: Date, isCurrentMonth: boolean) => ReactNode
}

export function CalendarGrid({ year, month, renderDay }: CalendarGridProps) {
  // Create date for the first day of the month
  const monthDate = new Date(year, month - 1, 1)
  const monthStart = startOfMonth(monthDate)
  const monthEnd = endOfMonth(monthDate)

  // Get the start and end of the calendar grid (including overflow days)
  // weekStartsOn: 1 means Monday
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  // Get all days to display
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Split into weeks (7 days each)
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className="w-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_HEADERS.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar weeks */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((date) => {
              const isCurrentMonth = isSameMonth(date, monthDate)
              return (
                <div
                  key={format(date, 'yyyy-MM-dd')}
                  className={isCurrentMonth ? '' : 'opacity-30'}
                >
                  {renderDay(date, isCurrentMonth)}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
