'use client'

import { format, isToday, isPast, isFuture, differenceInDays } from 'date-fns'
import { Check, X, Scale, Droplets, Salad, Dumbbell, Syringe } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useCalendarDay } from '@/hooks/useCalendarDay'
import { cn } from '@/lib/utils'

interface DayDetailDialogProps {
  date: string | null
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DayDetailDialog({
  date,
  userId,
  open,
  onOpenChange,
}: DayDetailDialogProps) {
  const { data, loading, error } = useCalendarDay(date, userId)

  const dateObj = date ? new Date(date) : null

  const getRelativeContext = (): string => {
    if (!dateObj) return ''

    if (isToday(dateObj)) return 'Today'

    const daysDiff = differenceInDays(new Date(), dateObj)

    if (daysDiff === 1) return 'Yesterday'
    if (daysDiff > 1) return `${daysDiff} days ago`

    return 'Future'
  }

  const formatFullDate = (): string => {
    if (!dateObj) return ''
    return format(dateObj, 'EEEE, MMMM d, yyyy')
  }

  const relativeContext = getRelativeContext()
  const fullDate = formatFullDate()
  const isFutureDay = dateObj ? isFuture(dateObj) : false
  const isPastDay = dateObj ? isPast(dateObj) && !isToday(dateObj) : false

  const hasAnyData = data?.habit || data?.weighIn || data?.injection

  const formatSiteName = (site: string): string => {
    return site
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{fullDate}</DialogTitle>
          <DialogDescription>{relativeContext}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {loading && (
            <div className="space-y-3">
              <div className="h-16 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-16 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-16 bg-white/5 rounded-lg animate-pulse" />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400">Failed to load day data</p>
          )}

          {!loading && !error && isFutureDay && (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm">
                No data for future days
              </p>
            </div>
          )}

          {!loading && !error && !isFutureDay && !hasAnyData && (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm">
                No activity recorded for this day
              </p>
            </div>
          )}

          {!loading && !error && data && !isFutureDay && (
            <>
              {/* Habits Section */}
              {data.habit && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white mb-3">
                    Daily Habits
                  </h3>
                  <div className="space-y-2">
                    <HabitRow
                      label="Water"
                      icon={Droplets}
                      completed={data.habit.water}
                    />
                    <HabitRow
                      label="Nutrition"
                      icon={Salad}
                      completed={data.habit.nutrition}
                    />
                    <HabitRow
                      label="Exercise"
                      icon={Dumbbell}
                      completed={data.habit.exercise}
                    />
                  </div>
                </div>
              )}

              {/* Weigh-in Section */}
              {data.weighIn && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white mb-2">
                    Weigh-in
                  </h3>
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-muted-foreground" />
                    <span className="text-lg font-semibold text-white">
                      {data.weighIn.weight} kg
                    </span>
                    {data.weighIn.change !== null && (
                      <span
                        className={cn(
                          'text-sm',
                          data.weighIn.change < 0
                            ? 'text-lime'
                            : data.weighIn.change > 0
                            ? 'text-red-400'
                            : 'text-muted-foreground'
                        )}
                      >
                        {data.weighIn.change > 0 ? '+' : ''}
                        {data.weighIn.change.toFixed(1)} kg
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Injection Section */}
              {data.injection && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white mb-2">
                    Injection
                  </h3>
                  <div className="flex items-center gap-3">
                    <Syringe className="h-5 w-5 text-lime" />
                    <span className="text-white">
                      {formatSiteName(data.injection.site)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface HabitRowProps {
  label: string
  icon: React.ComponentType<{ className?: string }>
  completed: boolean
}

function HabitRow({ label, icon: Icon, completed }: HabitRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-white">{label}</span>
      </div>
      {completed ? (
        <Check className="h-4 w-4 text-lime" />
      ) : (
        <X className="h-4 w-4 text-red-400" />
      )}
    </div>
  )
}
