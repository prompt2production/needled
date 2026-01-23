'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { HabitType } from '@/lib/validations/habit'

interface HabitRowProps {
  habit: HabitType
  label: string
  icon: LucideIcon
  checked: boolean
  onToggle: (habit: HabitType, value: boolean) => void
  disabled?: boolean
}

export function HabitRow({
  habit,
  label,
  icon: Icon,
  checked,
  onToggle,
  disabled = false,
}: HabitRowProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onToggle(habit, !checked)}
      disabled={disabled}
      className={cn(
        'w-full flex items-center justify-between py-3 px-2 rounded-lg transition-colors min-h-[56px]',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-white/5 cursor-pointer'
      )}
      aria-label={`${checked ? 'Uncheck' : 'Check'} ${label}`}
    >
      {/* Icon and label */}
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium text-white">{label}</span>
      </div>

      {/* Toggle indicator */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
          checked
            ? 'bg-lime text-black'
            : 'border border-white/20'
        )}
      >
        {checked && <Check className="h-4 w-4" />}
      </div>
    </button>
  )
}
