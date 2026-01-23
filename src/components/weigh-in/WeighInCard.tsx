'use client'

import { useState } from 'react'
import { Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WeighInInput } from './WeighInInput'

interface WeighInCardProps {
  canWeighIn: boolean
  weightUnit: 'kg' | 'lbs'
  onSubmit: (weight: number) => Promise<void>
  isLoading?: boolean
}

export function WeighInCard({
  canWeighIn,
  weightUnit,
  onSubmit,
  isLoading = false,
}: WeighInCardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (!canWeighIn) {
    // Will be implemented in WEIGH-010
    return null
  }

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime/10">
            <Scale className="h-6 w-6 text-lime" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium text-white">Log your weight</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track your progress with a weekly weigh-in
            </p>
          </div>
        </div>

        <Button
          onClick={() => setDrawerOpen(true)}
          className="bg-lime text-black hover:bg-lime-muted font-medium w-full mt-4"
          disabled={isLoading}
        >
          Log Weight
        </Button>
      </div>

      <WeighInInput
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSubmit={onSubmit}
        weightUnit={weightUnit}
        isLoading={isLoading}
      />
    </>
  )
}
