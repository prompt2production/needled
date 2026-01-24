'use client'

import { useState, useEffect } from 'react'
import { format, subDays, startOfDay } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
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

interface WeighInEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  weighIn: {
    id: string
    weight: number
    date: string
  }
  weightUnit: 'kg' | 'lbs'
  userId: string
  onSuccess: () => void
}

const MIN_WEIGHT = 40
const MAX_WEIGHT = 300
const MAX_DAYS_IN_PAST = 90

export function WeighInEditDialog({
  open,
  onOpenChange,
  weighIn,
  weightUnit,
  userId,
  onSuccess,
}: WeighInEditDialogProps) {
  const [weight, setWeight] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      setWeight(weighIn.weight.toString())
      setSelectedDate(new Date(weighIn.date))
      setError(null)
    }
  }, [open, weighIn])

  const weightNum = parseFloat(weight)
  const isValid =
    !isNaN(weightNum) && weightNum >= MIN_WEIGHT && weightNum <= MAX_WEIGHT

  const handleSubmit = async () => {
    if (!isValid) return
    setError(null)
    setIsLoading(true)

    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd')
      const response = await fetch(`/api/weigh-ins/${weighIn.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, weight: weightNum, date: dateString }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update')
      }

      toast.success('Weigh-in updated')
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error('Error updating weigh-in:', err)
      setError('Failed to save. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWeightChange = (value: string) => {
    setWeight(value)
    setError(null)
  }

  const today = startOfDay(new Date())
  const minDate = subDays(today, MAX_DAYS_IN_PAST)

  const isDateDisabled = (date: Date) => {
    const d = startOfDay(date)
    return d > today || d < minDate
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card-elevated border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Edit weigh-in</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update the weight or date for this entry
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
            <Label htmlFor="edit-weight" className="text-sm text-muted-foreground">
              Weight
            </Label>
            <div className="relative">
              <Input
                id="edit-weight"
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
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
