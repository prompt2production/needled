'use client'

import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakSummaryProps {
  currentStreak: number
  bestStreak: number
}

export function StreakSummary({ currentStreak, bestStreak }: StreakSummaryProps) {
  const hasActiveStreak = currentStreak >= 2

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-4 text-sm">
      <div className="flex items-center gap-2">
        <Flame
          className={cn(
            'h-5 w-5 transition-colors',
            hasActiveStreak ? 'text-lime animate-pulse' : 'text-muted-foreground'
          )}
        />
        <span className={cn(hasActiveStreak ? 'text-white' : 'text-muted-foreground')}>
          Current Streak:{' '}
          <span className={cn('font-medium', hasActiveStreak && 'text-lime')}>
            {currentStreak >= 2 ? `${currentStreak} days` : 'None'}
          </span>
        </span>
      </div>

      <span className="hidden sm:inline text-muted-foreground">|</span>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">
          Best This Month:{' '}
          <span className={cn('font-medium', bestStreak >= 2 ? 'text-white' : 'text-muted-foreground')}>
            {bestStreak >= 2 ? `${bestStreak} days` : 'None'}
          </span>
        </span>
      </div>
    </div>
  )
}
