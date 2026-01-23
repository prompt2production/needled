'use client'

import { cn } from '@/lib/utils'

export type HabitIndicatorState = 'completed' | 'today' | 'past' | 'future'

interface HabitIndicatorProps {
  state: HabitIndicatorState
  label: string
  onClick?: () => void
}

export function HabitIndicator({ state, label, onClick }: HabitIndicatorProps) {
  const isClickable = state === 'today' && onClick

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
        // Completed state
        state === 'completed' && 'bg-lime text-black',
        // Today state (not done)
        state === 'today' && 'border border-white/20 text-white/60 cursor-pointer hover:border-lime/50 hover:text-white/80',
        // Past state (not completed)
        state === 'past' && 'border border-white/20 text-white/40',
        // Future state
        state === 'future' && 'border border-white/10 text-white/20',
        // Disabled state for non-clickable
        !isClickable && 'cursor-default'
      )}
      aria-label={`${label} - ${state}`}
    >
      {label}
    </button>
  )
}
