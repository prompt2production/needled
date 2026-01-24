'use client'

import { cn } from '@/lib/utils'

export type HabitIndicatorState = 'completed' | 'today' | 'past' | 'future'

interface HabitIndicatorProps {
  state: HabitIndicatorState
  label: string
  onClick?: () => void
}

export function HabitIndicator({ state, label, onClick }: HabitIndicatorProps) {
  // Clickable if we have an onClick handler (today and past days are clickable, completed can be toggled off)
  const isClickable = !!onClick

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
        // Completed state
        state === 'completed' && 'bg-lime text-black',
        state === 'completed' && isClickable && 'cursor-pointer hover:bg-lime/80',
        // Today state (not done)
        state === 'today' && 'border border-white/20 text-white/60',
        state === 'today' && isClickable && 'cursor-pointer hover:border-lime/50 hover:text-white/80',
        // Past state (not completed) - now clickable
        state === 'past' && 'border border-white/20 text-white/40',
        state === 'past' && isClickable && 'cursor-pointer hover:border-lime/50 hover:text-white/60',
        // Future state
        state === 'future' && 'border border-white/10 text-white/20 cursor-default'
      )}
      aria-label={`${label} - ${state}`}
    >
      {label}
    </button>
  )
}
