'use client'

import { cn } from '@/lib/utils'

interface DosesRemainingCardProps {
  currentDose: number | null
  dosesRemaining: number
}

export function DosesRemainingCard({
  currentDose,
  dosesRemaining,
}: DosesRemainingCardProps) {
  const isLastDose = currentDose === 4
  const doseLabel = currentDose ? `Dose ${currentDose} of 4` : 'No doses logged'

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="text-base font-medium text-white mb-3">Pen Status</h3>

      {/* Visual progress indicator */}
      <div className="flex gap-2 mb-3">
        {[1, 2, 3, 4].map((dose) => {
          const isUsed = currentDose != null && dose <= currentDose
          return (
            <div
              key={dose}
              className={cn(
                'h-3 w-3 rounded-full transition-colors',
                isUsed ? 'bg-lime' : 'bg-white/20'
              )}
              aria-label={`Dose ${dose} ${isUsed ? 'used' : 'remaining'}`}
            />
          )
        })}
      </div>

      {/* Status text */}
      <p className="text-sm text-muted-foreground">{doseLabel}</p>

      {isLastDose ? (
        <p className="text-sm text-amber-500 mt-1">Last dose - time to reorder</p>
      ) : (
        <p className="text-sm text-muted-foreground mt-1">
          {dosesRemaining} {dosesRemaining === 1 ? 'dose' : 'doses'} remaining
        </p>
      )}
    </div>
  )
}
