'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface GoalWeightStepProps {
  onNext: (data: { goalWeight: number | null }) => void
  startWeight: number
  weightUnit: 'kg' | 'lbs'
  defaultValue?: number | null
}

export function GoalWeightStep({
  onNext,
  startWeight,
  weightUnit,
  defaultValue = null,
}: GoalWeightStepProps) {
  const [weight, setWeight] = useState(defaultValue?.toString() || '')

  const weightNum = parseFloat(weight)
  const minWeight = weightUnit === 'kg' ? 40 : 90
  const maxWeight = weightUnit === 'kg' ? 300 : 660

  const isValidRange =
    !isNaN(weightNum) && weightNum >= minWeight && weightNum <= maxWeight
  const isLessThanStart = !isNaN(weightNum) && weightNum < startWeight
  const isValid = isValidRange && isLessThanStart

  const difference = startWeight - weightNum

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onNext({ goalWeight: weightNum })
    }
  }

  const handleSkip = () => {
    onNext({ goalWeight: null })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col px-4 space-y-8">
      {/* Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-white">
          What's your goal weight?
        </h1>
        <p className="text-muted-foreground text-sm">
          Optional—you can set this later
        </p>
      </div>

      {/* Weight input */}
      <div className="space-y-2">
        <Label htmlFor="goalWeight" className="sr-only">
          Your goal weight
        </Label>
        <div className="relative">
          <Input
            id="goalWeight"
            type="number"
            inputMode="decimal"
            placeholder="0.0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="bg-input border-border text-white text-lg h-12 pr-12"
            autoFocus
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {weightUnit}
          </span>
        </div>

        {/* Difference display */}
        {weight && isValid && (
          <p className="text-lime text-sm text-center">
            That's {difference.toFixed(1)} {weightUnit} to lose
          </p>
        )}

        {/* Validation errors */}
        {weight && !isValidRange && (
          <p className="text-red-400 text-xs">
            Weight must be between {minWeight} and {maxWeight} {weightUnit}
          </p>
        )}
        {weight && isValidRange && !isLessThanStart && (
          <p className="text-red-400 text-xs">
            Goal must be less than your starting weight ({startWeight} {weightUnit})
          </p>
        )}
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        <Button
          type="submit"
          disabled={!isValid}
          className="bg-lime text-black hover:bg-lime-muted font-medium w-full h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
        <button
          type="button"
          onClick={handleSkip}
          className="w-full text-center text-muted-foreground text-sm hover:text-white transition-colors"
        >
          Skip for now
        </button>
      </div>
    </form>
  )
}
