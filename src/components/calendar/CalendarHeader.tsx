'use client'

import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CalendarHeaderProps {
  year: number
  month: number
  onNavigate: (year: number, month: number) => void
  isCurrentMonth: boolean
}

export function CalendarHeader({
  year,
  month,
  onNavigate,
  isCurrentMonth,
}: CalendarHeaderProps) {
  const monthDate = new Date(year, month - 1, 1)
  const monthLabel = format(monthDate, 'MMMM yyyy')

  const handlePreviousMonth = () => {
    if (month === 1) {
      onNavigate(year - 1, 12)
    } else {
      onNavigate(year, month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      onNavigate(year + 1, 1)
    } else {
      onNavigate(year, month + 1)
    }
  }

  const handleToday = () => {
    const now = new Date()
    onNavigate(now.getFullYear(), now.getMonth() + 1)
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-white">{monthLabel}</h2>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousMonth}
          className="text-muted-foreground hover:text-white hover:bg-white/5"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleToday}
          className="text-muted-foreground hover:text-white hover:bg-white/5"
          disabled={isCurrentMonth}
        >
          Today
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="text-muted-foreground hover:text-white hover:bg-white/5"
          disabled={isCurrentMonth}
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
