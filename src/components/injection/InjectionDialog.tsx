'use client'

import { useState } from 'react'
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
import { InjectionSiteSelector } from './InjectionSiteSelector'
import type { InjectionSite } from '@/lib/validations/injection'

interface InjectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { site: InjectionSite; notes?: string }) => Promise<void>
  suggestedSite?: InjectionSite | null
  lastUsedSite?: InjectionSite | null
  isSubmitting?: boolean
}

export function InjectionDialog({
  open,
  onOpenChange,
  onSubmit,
  suggestedSite = null,
  lastUsedSite = null,
  isSubmitting = false,
}: InjectionDialogProps) {
  const [site, setSite] = useState<InjectionSite | null>(null)
  const [notes, setNotes] = useState('')

  const handleSubmit = async () => {
    if (!site) return
    await onSubmit({ site, notes: notes.trim() || undefined })
    // Reset state after successful submission
    setSite(null)
    setNotes('')
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setSite(null)
      setNotes('')
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
            disabled={!site || isSubmitting}
            className="bg-lime text-black hover:bg-lime-muted font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Logging...' : 'Log Injection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
