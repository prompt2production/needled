'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface WeighInInputProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (weight: number) => Promise<void>
  weightUnit: 'kg' | 'lbs'
  isLoading?: boolean
}

const MIN_WEIGHT = 40
const MAX_WEIGHT = 300

export function WeighInInput({
  open,
  onOpenChange,
  onSubmit,
  weightUnit,
  isLoading = false,
}: WeighInInputProps) {
  const [weight, setWeight] = useState('')
  const [error, setError] = useState<string | null>(null)

  const weightNum = parseFloat(weight)
  const isValid =
    !isNaN(weightNum) && weightNum >= MIN_WEIGHT && weightNum <= MAX_WEIGHT

  const handleSubmit = async () => {
    if (!isValid) return
    setError(null)

    try {
      await onSubmit(weightNum)
      setWeight('')
      onOpenChange(false)
    } catch (err) {
      setError('Failed to save. Please try again.')
    }
  }

  const handleWeightChange = (value: string) => {
    setWeight(value)
    setError(null)
  }

  const today = format(new Date(), 'EEEE, d MMMM yyyy')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card-elevated border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Log your weight</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {today}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-sm text-muted-foreground">
              Weight
            </Label>
            <div className="relative">
              <Input
                id="weight"
                type="number"
                inputMode="decimal"
                step="0.1"
                min={MIN_WEIGHT}
                max={MAX_WEIGHT}
                placeholder="0.0"
                value={weight}
                onChange={(e) => handleWeightChange(e.target.value)}
                className="bg-input border-border text-white text-lg h-12 pr-12"
                disabled={isLoading}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {weightUnit}
              </span>
            </div>
            {weight && !isValid && (
              <p className="text-red-400 text-xs">
                Weight must be between {MIN_WEIGHT} and {MAX_WEIGHT} {weightUnit}
              </p>
            )}
            {error && <p className="text-red-400 text-xs">{error}</p>}
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-muted-foreground hover:text-white hover:bg-white/5"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className="bg-lime text-black hover:bg-lime-muted font-medium w-full sm:w-auto"
          >
            {isLoading ? 'Saving...' : 'Log Weight'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
