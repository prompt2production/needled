'use client'

import { useState, useEffect } from 'react'
import { format, subDays, startOfDay } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { InjectionSiteSelector } from './InjectionSiteSelector'
import type { InjectionSite } from '@/lib/validations/injection'

interface InjectionEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  injection: {
    id: string
    site: string
    notes: string | null
    date: string
  }
  userId: string
  onSuccess: () => void
}

const MAX_DAYS_IN_PAST = 90

export function InjectionEditDialog({
  open,
  onOpenChange,
  injection,
  userId,
  onSuccess,
}: InjectionEditDialogProps) {
  const [site, setSite] = useState<InjectionSite | null>(null)
  const [notes, setNotes] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      setSite(injection.site as InjectionSite)
      setNotes(injection.notes || '')
      setSelectedDate(new Date(injection.date))
      setError(null)
    }
  }, [open, injection])

  const handleSubmit = async () => {
    if (!site) return
    setError(null)
    setIsLoading(true)

    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd')
      const response = await fetch(`/api/injections/${injection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          site,
          notes: notes.trim() || undefined,
          date: dateString,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update')
      }

      toast.success('Injection updated')
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error('Error updating injection:', err)
      setError('Failed to save. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
          <DialogTitle className="text-white text-lg">Edit injection</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update the date, site, or notes for this entry
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
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

          {/* Site selection */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">
              Injection Site
            </Label>
            <InjectionSiteSelector
              value={site}
              onChange={setSite}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes" className="text-sm text-muted-foreground">
              Notes (optional)
            </Label>
            <textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it go?"
              maxLength={500}
              rows={3}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-lime/50 resize-none"
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
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
            disabled={!site || isLoading}
            className="bg-lime text-black hover:bg-lime-muted font-medium w-full sm:w-auto"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
