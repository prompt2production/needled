'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface StartWeightStepProps {
  onNext: (data: { startWeight: number; weightUnit: 'kg' | 'lbs' }) => void
  defaultWeight?: number | null
  defaultUnit?: 'kg' | 'lbs'
}

export function StartWeightStep({
  onNext,
  defaultWeight = null,
  defaultUnit = 'kg',
}: StartWeightStepProps) {
  const [weight, setWeight] = useState(defaultWeight?.toString() || '')
  const [unit, setUnit] = useState<'kg' | 'lbs'>(defaultUnit)

  const weightNum = parseFloat(weight)
  const minWeight = unit === 'kg' ? 40 : 90
  const maxWeight = unit === 'kg' ? 300 : 660

  const isValid =
    !isNaN(weightNum) && weightNum >= minWeight && weightNum <= maxWeight

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onNext({ startWeight: weightNum, weightUnit: unit })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col px-4 space-y-8">
      {/* Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-white">
          What's your current weight?
        </h1>
        <p className="text-muted-foreground text-sm">
          This is your starting point
        </p>
      </div>

      {/* Unit toggle */}
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setUnit('kg')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            unit === 'kg'
              ? 'bg-lime text-black'
              : 'bg-white/10 text-white hover:bg-white/15'
          }`}
        >
          kg
        </button>
        <button
          type="button"
          onClick={() => setUnit('lbs')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            unit === 'lbs'
              ? 'bg-lime text-black'
              : 'bg-white/10 text-white hover:bg-white/15'
          }`}
        >
          lbs
        </button>
      </div>

      {/* Weight input */}
      <div className="space-y-2">
        <Label htmlFor="weight" className="sr-only">
          Your weight
        </Label>
        <div className="relative">
          <Input
            id="weight"
            type="number"
            inputMode="decimal"
            placeholder="0.0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="bg-input border-border text-white text-lg h-12 pr-12"
            autoFocus
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {unit}
          </span>
        </div>
        {weight && !isValid && (
          <p className="text-red-400 text-xs">
            Weight must be between {minWeight} and {maxWeight} {unit}
          </p>
        )}
      </div>

      {/* CTA */}
      <Button
        type="submit"
        disabled={!isValid}
        className="bg-lime text-black hover:bg-lime-muted font-medium w-full h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </Button>
    </form>
  )
}
