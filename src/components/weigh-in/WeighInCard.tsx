'use client'

import { useState } from 'react'
import { Scale, TrendingDown, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { WeighInInput } from './WeighInInput'

interface WeighInData {
  weight: number
  date: Date | string
}

interface WeighInCardProps {
  canWeighIn: boolean
  weightUnit: 'kg' | 'lbs'
  onSubmit: (weight: number) => Promise<void>
  isLoading?: boolean
  weighIn?: WeighInData | null
  weekChange?: number | null
}

export function WeighInCard({
  canWeighIn,
  weightUnit,
  onSubmit,
  isLoading = false,
  weighIn,
  weekChange,
}: WeighInCardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Already Logged state (WEIGH-010)
  if (!canWeighIn && weighIn) {
    const loggedDate = new Date(weighIn.date)
    const relativeDate = formatDistanceToNow(loggedDate, { addSuffix: true })
    const isToday = new Date().toDateString() === loggedDate.toDateString()
    const dateDisplay = isToday ? 'Today' : `Logged ${relativeDate}`

    const isLoss = weekChange !== null && weekChange < 0
    const isGain = weekChange !== null && weekChange > 0

    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">This week</span>
          <span className="text-xs text-muted-foreground">{dateDisplay}</span>
        </div>

        <div className="text-center py-4">
          <p className="text-4xl font-bold text-white">
            {weighIn.weight.toFixed(1)}
            <span className="text-lg ml-1 text-muted-foreground">{weightUnit}</span>
          </p>

          {weekChange !== null && weekChange !== 0 && (
            <p
              className={`text-sm flex items-center justify-center gap-1 mt-2 ${
                isLoss ? 'text-green-500' : isGain ? 'text-red-500' : 'text-muted-foreground'
              }`}
            >
              {isLoss ? (
                <TrendingDown className="h-4 w-4" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              {weekChange > 0 ? '+' : ''}{weekChange.toFixed(1)} {weightUnit} from last week
            </p>
          )}

          {weekChange === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Same as last week
            </p>
          )}
        </div>
      </div>
    )
  }

  // Can Weigh In state (WEIGH-009)
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
