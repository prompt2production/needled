'use client'

import Link from 'next/link'
import { TrendingDown, TrendingUp, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressRing } from './ProgressRing'

interface WeightProgressCardProps {
  currentWeight: number | null
  startWeight: number
  totalLost: number | null
  weekChange: number | null
  progressPercent: number | null
  weightUnit: string
  canWeighIn: boolean
  isLoading?: boolean
}

export function WeightProgressCard({
  currentWeight,
  startWeight,
  totalLost,
  weekChange,
  progressPercent,
  weightUnit,
  canWeighIn,
  isLoading = false,
}: WeightProgressCardProps) {
  if (isLoading) {
    return <WeightProgressCardSkeleton />
  }

  const hasWeighIns = currentWeight != null
  const displayWeight = hasWeighIns ? currentWeight : startWeight
  const displayProgress = progressPercent ?? 0

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-white flex items-center gap-2">
          <Scale className="h-4 w-4 text-lime" />
          Weight Progress
        </h3>
      </div>

      <div className="flex flex-col items-center">
        {/* Progress Ring */}
        <ProgressRing value={displayProgress} size={140} strokeWidth={10}>
          <span className="text-2xl font-bold text-white">
            {totalLost != null ? (
              <>
                {totalLost > 0 ? '-' : '+'}
                {Math.abs(totalLost).toFixed(1)}
              </>
            ) : (
              '0'
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {weightUnit} lost
          </span>
        </ProgressRing>

        {/* Current/Starting Weight */}
        <div className="mt-4 text-center">
          {hasWeighIns ? (
            <>
              <p className="text-4xl font-bold text-white">
                {displayWeight.toFixed(1)}
                <span className="text-lg ml-1">{weightUnit}</span>
              </p>
              {/* Week Change */}
              {weekChange != null && (
                <p
                  className={`text-sm flex items-center justify-center gap-1 mt-1 ${
                    weekChange < 0 ? 'text-green-500' : weekChange > 0 ? 'text-red-400' : 'text-muted-foreground'
                  }`}
                >
                  {weekChange < 0 ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : weekChange > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : null}
                  {weekChange < 0 ? '' : '+'}
                  {weekChange.toFixed(1)} this week
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-1">Starting weight</p>
              <p className="text-4xl font-bold text-white">
                {startWeight.toFixed(1)}
                <span className="text-lg ml-1">{weightUnit}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Log your first weigh-in to track progress
              </p>
            </>
          )}
        </div>

        {/* CTA Button */}
        {canWeighIn && (
          <Link href="/weigh-in" className="w-full mt-4">
            <Button className="w-full bg-lime text-black hover:bg-lime-muted font-medium">
              Log This Week's Weight
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

function WeightProgressCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 bg-white/5 rounded animate-pulse w-32" />
      </div>

      <div className="flex flex-col items-center">
        {/* Ring skeleton */}
        <div className="w-[140px] h-[140px] rounded-full bg-white/5 animate-pulse" />

        {/* Weight skeleton */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="h-10 bg-white/5 rounded animate-pulse w-28" />
          <div className="h-4 bg-white/5 rounded animate-pulse w-20" />
        </div>

        {/* Button skeleton */}
        <div className="h-10 bg-white/5 rounded-lg animate-pulse w-full mt-4" />
      </div>
    </div>
  )
}
