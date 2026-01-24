'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { InjectionCard } from './InjectionCard'
import type { InjectionSite } from '@/lib/validations/injection'
import { getSiteLabel } from '@/lib/injection-site'
import type { InjectionStatusResponse } from '@/app/api/injections/status/route'

interface InjectionCardConnectedProps {
  userId: string
  medicationName: string
  injectionDayName: string
}

export function InjectionCardConnected({
  userId,
  medicationName,
  injectionDayName,
}: InjectionCardConnectedProps) {
  const [data, setData] = useState<InjectionStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/injections/status?userId=${userId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch injection status')
      }

      const result: InjectionStatusResponse = await response.json()
      setData(result)
    } catch (err) {
      setError('Failed to load injection data')
      console.error('Error fetching injection status:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const handleSubmit = async (submitData: { site: InjectionSite; notes?: string; date: string }) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/injections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...submitData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to log injection')
      }

      // Refetch the status to get the updated state
      await fetchStatus()

      const siteLabel = getSiteLabel(submitData.site)
      toast.success('Injection logged', { description: siteLabel })
    } catch (err) {
      console.error('Error submitting injection:', err)
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
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-white/5 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-white/5 rounded animate-pulse w-32" />
              <div className="h-4 bg-white/5 rounded animate-pulse w-48" />
            </div>
          </div>
          <div className="h-10 bg-white/5 rounded-lg animate-pulse w-full mt-4" />
        </div>
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <p className="text-red-400 text-sm">{error || 'Something went wrong'}</p>
        <button
          onClick={fetchStatus}
          className="text-lime text-sm mt-2 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <InjectionCard
      status={data.status}
      daysUntil={data.daysUntil}
      daysOverdue={data.daysOverdue}
      lastInjection={data.lastInjection}
      suggestedSite={data.suggestedSite}
      medicationName={medicationName}
      injectionDayName={injectionDayName}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  )
}
