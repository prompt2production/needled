'use client'

import { useState, useEffect } from 'react'
import { format, subDays, startOfDay } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { InjectionSiteSelector } from './InjectionSiteSelector'
import { DoseSelector } from './DoseSelector'
import type { InjectionSite } from '@/lib/validations/injection'

interface InjectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { site: InjectionSite; doseNumber: number; notes?: string; date: string }) => Promise<void>
  suggestedSite?: InjectionSite | null
  lastUsedSite?: InjectionSite | null
  suggestedDose?: number | null
  isSubmitting?: boolean
}

const MAX_DAYS_IN_PAST = 90

export function InjectionDialog({
  open,
  onOpenChange,
  onSubmit,
  suggestedSite = null,
  lastUsedSite = null,
  suggestedDose = null,
  isSubmitting = false,
}: InjectionDialogProps) {
  const [site, setSite] = useState<InjectionSite | null>(null)
  const [doseNumber, setDoseNumber] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSite(null)
      setDoseNumber(suggestedDose)
      setNotes('')
      setSelectedDate(new Date())
    }
  }, [open, suggestedDose])

  const today = startOfDay(new Date())
  const minDate = subDays(today, MAX_DAYS_IN_PAST)

  // Disable dates that are in the future or more than 90 days in the past
  const isDateDisabled = (date: Date) => {
    const d = startOfDay(date)
    return d > today || d < minDate
  }

  const handleSubmit = async () => {
    if (!site || !doseNumber) return
    const dateString = format(selectedDate, 'yyyy-MM-dd')
    await onSubmit({ site, doseNumber, notes: notes.trim() || undefined, date: dateString })
    // Reset state after successful submission
    setSite(null)
    setDoseNumber(suggestedDose)
    setNotes('')
    setSelectedDate(new Date())
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setSite(null)
      setDoseNumber(suggestedDose)
      setNotes('')
      setSelectedDate(new Date())
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card-elevated border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Log Injection</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select the injection site and optionally add notes
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
                  disabled={isSubmitting}
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
              suggestedSite={suggestedSite}
              lastUsedSite={lastUsedSite}
            />
          </div>

          {/* Dose selection */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">
              Dose Number
            </Label>
            <DoseSelector
              value={doseNumber}
              onChange={setDoseNumber}
              suggestedDose={suggestedDose}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm text-muted-foreground">
              Notes (optional)
            </Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it go?"
              maxLength={500}
              rows={3}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-lime/50 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            className="text-muted-foreground hover:text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!site || !doseNumber || isSubmitting}
            className="bg-lime text-black hover:bg-lime-muted font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Logging...' : 'Log Injection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
