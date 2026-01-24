'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { WeighInCard } from './WeighInCard'

interface LatestWeighInResponse {
  weighIn: {
    id: string
    weight: number
    date: string
  } | null
  weekChange: number | null
  totalChange: number | null
  canWeighIn: boolean
  hasWeighedThisWeek: boolean
}

interface WeighInCardConnectedProps {
  userId: string
  weightUnit: 'kg' | 'lbs'
  startWeight: number
}

export function WeighInCardConnected({
  userId,
  weightUnit,
  startWeight,
}: WeighInCardConnectedProps) {
  const [data, setData] = useState<LatestWeighInResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLatestWeighIn = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/weigh-ins/latest?userId=${userId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch weigh-in data')
      }

      const result: LatestWeighInResponse = await response.json()
      setData(result)
    } catch (err) {
      setError('Failed to load weigh-in data')
      console.error('Error fetching weigh-in:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchLatestWeighIn()
  }, [fetchLatestWeighIn])

  const handleSubmit = async (weight: number, date: string) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/weigh-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, weight, date }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to log weight')
      }

      // Refetch the latest data to get the updated state
      await fetchLatestWeighIn()

      // Calculate change for toast message
      const previousWeight = data?.weighIn?.weight
      const change = previousWeight ? weight - previousWeight : null

      if (change !== null && change !== 0) {
        const changeText =
          change < 0
            ? `Down ${Math.abs(change).toFixed(1)} ${weightUnit} from last week!`
            : `Up ${change.toFixed(1)} ${weightUnit} from last week`

        toast.success('Weight logged', { description: changeText })
      } else {
        toast.success('Weight logged')
      }
    } catch (err) {
      console.error('Error submitting weigh-in:', err)
      toast.error('Could not save', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="space-y-3">
          <div className="h-8 bg-white/5 rounded-lg animate-pulse w-24" />
          <div className="h-4 bg-white/5 rounded animate-pulse w-32" />
          <div className="h-10 bg-white/5 rounded-lg animate-pulse w-full mt-4" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={fetchLatestWeighIn}
          className="text-lime text-sm mt-2 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  // Determine if this is the first time
  const isFirstTime = data?.weighIn === null && data?.canWeighIn

  return (
    <WeighInCard
      canWeighIn={data?.canWeighIn ?? true}
      weightUnit={weightUnit}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      weighIn={data?.weighIn ?? undefined}
      weekChange={data?.weekChange}
      startWeight={startWeight}
      isFirstTime={isFirstTime}
      hasWeighedThisWeek={data?.hasWeighedThisWeek ?? false}
    />
  )
}
