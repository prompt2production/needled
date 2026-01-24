'use client'

import { useState, useEffect } from 'react'
import { format, subDays, startOfDay } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface WeighInInputProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (weight: number, date: string) => Promise<void>
  weightUnit: 'kg' | 'lbs'
  isLoading?: boolean
  hasWeighedThisWeek?: boolean
}

const MIN_WEIGHT = 40
const MAX_WEIGHT = 300
const MAX_DAYS_IN_PAST = 90

export function WeighInInput({
  open,
  onOpenChange,
  onSubmit,
  weightUnit,
  isLoading = false,
  hasWeighedThisWeek = false,
}: WeighInInputProps) {
  const [weight, setWeight] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setWeight('')
      setSelectedDate(new Date())
      setError(null)
    }
  }, [open])

  const weightNum = parseFloat(weight)
  const isValid =
    !isNaN(weightNum) && weightNum >= MIN_WEIGHT && weightNum <= MAX_WEIGHT

  const handleSubmit = async () => {
    if (!isValid) return
    setError(null)

    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd')
      await onSubmit(weightNum, dateString)
      setWeight('')
      setSelectedDate(new Date())
      onOpenChange(false)
    } catch {
      setError('Failed to save. Please try again.')
    }
  }

  const handleWeightChange = (value: string) => {
    setWeight(value)
    setError(null)
  }

  const today = startOfDay(new Date())
  const minDate = subDays(today, MAX_DAYS_IN_PAST)

  // Disable dates that are in the future or more than 90 days in the past
  const isDateDisabled = (date: Date) => {
    const d = startOfDay(date)
    return d > today || d < minDate
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card-elevated border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Log your weight</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Record your weight for a specific date
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Date picker */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal h-12',
                    'bg-input border-border text-white hover:bg-white/5 hover:text-white',
                    !selectedDate && 'text-muted-foreground'
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {selectedDate ? format(selectedDate, 'EEEE, d MMMM yyyy') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card-elevated border-border" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={isDateDisabled}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Weight input */}
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

          {/* Info message for multiple weigh-ins */}
          {hasWeighedThisWeek && (
            <p className="text-sm text-muted-foreground bg-white/5 p-3 rounded-lg">
              You&apos;ve already logged this week. Multiple entries are fine, but weekly tracking works best.
            </p>
          )}
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
