'use client'

import { cn } from '@/lib/utils'

interface DoseSelectorProps {
  value: number | null
  onChange: (dose: number) => void
  suggestedDose?: number | null
}

const DOSES = [1, 2, 3, 4] as const

export function DoseSelector({
  value,
  onChange,
  suggestedDose = null,
}: DoseSelectorProps) {
  return (
    <div className="flex gap-2">
      {DOSES.map((dose) => {
        const isSelected = value === dose
        const isSuggested = suggestedDose === dose

        return (
          <button
            key={dose}
            type="button"
            onClick={() => onChange(dose)}
            className={cn(
              'relative flex flex-col items-center justify-center min-w-[64px] min-h-[56px] px-4 py-3 rounded-xl text-sm font-medium transition-colors',
              isSelected
                ? 'bg-lime text-black'
                : isSuggested
                ? 'bg-lime/15 text-lime border border-lime/30 hover:bg-lime/20'
                : 'bg-white/10 text-white hover:bg-white/15'
            )}
          >
            <span className="text-lg">{dose}</span>
            {isSuggested && !isSelected && (
              <span className="text-[10px] mt-0.5 font-normal opacity-80">
                Suggested
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
