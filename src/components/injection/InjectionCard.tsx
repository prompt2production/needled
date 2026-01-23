'use client'

import { useState } from 'react'
import { Syringe, Check, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { InjectionDialog } from './InjectionDialog'
import type { InjectionSite } from '@/lib/validations/injection'
import { getSiteLabel } from '@/lib/injection-site'
import type { InjectionStatus } from '@/app/api/injections/status/route'

interface InjectionData {
  id: string
  site: string
  date: string
  notes: string | null
}

interface InjectionCardProps {
  status: InjectionStatus
  daysUntil: number
  daysOverdue: number
  lastInjection: InjectionData | null
  suggestedSite: InjectionSite
  medicationName: string
  injectionDayName: string
  onSubmit: (data: { site: InjectionSite; notes?: string }) => Promise<void>
  isSubmitting?: boolean
}

export function InjectionCard({
  status,
  daysUntil,
  daysOverdue,
  lastInjection,
  suggestedSite,
  medicationName,
  injectionDayName,
  onSubmit,
  isSubmitting = false,
}: InjectionCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSubmit = async (data: { site: InjectionSite; notes?: string }) => {
    await onSubmit(data)
    setDialogOpen(false)
  }

  // Done state (INJ-011)
  if (status === 'done' && lastInjection) {
    const loggedDate = new Date(lastInjection.date)
    const dayName = format(loggedDate, 'EEEE')
    const siteLabel = getSiteLabel(lastInjection.site as InjectionSite)

    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime/10">
            <Check className="h-6 w-6 text-lime" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium text-white">Injection Done</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Logged {dayName}
            </p>
            <p className="text-sm text-muted-foreground">
              {siteLabel}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Link href="/injection">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-white hover:bg-white/5 text-sm"
            >
              View History
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Overdue state (INJ-012)
  if (status === 'overdue') {
    return (
      <>
        <div className="bg-card rounded-xl border border-amber-500/30 p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-medium text-white">Injection Overdue</h3>
              <p className="text-sm text-amber-500 mt-1">
                {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
              </p>
            </div>
          </div>

          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-lime text-black hover:bg-lime-muted font-medium w-full mt-4"
            disabled={isSubmitting}
          >
            Log Injection
          </Button>
        </div>

        <InjectionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          suggestedSite={suggestedSite}
          lastUsedSite={lastInjection?.site as InjectionSite | undefined}
          isSubmitting={isSubmitting}
        />
      </>
    )
  }

  // Upcoming state (INJ-013)
  if (status === 'upcoming') {
    const daysText = daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`

    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
            <Syringe className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium text-white">Next Injection</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {daysText}
            </p>
            <p className="text-sm text-muted-foreground">
              {injectionDayName}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Due state (INJ-010) - default
  return (
    <>
      <div className="bg-lime/10 rounded-xl border border-lime/20 p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime/20">
            <Syringe className="h-6 w-6 text-lime" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium text-white">Injection Day</h3>
            <p className="text-sm text-lime/80 mt-1">
              Time to take your {medicationName}
            </p>
          </div>
        </div>

        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-lime text-black hover:bg-lime-muted font-medium w-full mt-4"
          disabled={isSubmitting}
        >
          Log Injection
        </Button>
      </div>

      <InjectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        suggestedSite={suggestedSite}
        lastUsedSite={lastInjection?.site as InjectionSite | undefined}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
