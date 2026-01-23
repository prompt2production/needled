'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { getSiteLabel } from '@/lib/injection-site'
import type { InjectionSite } from '@/lib/validations/injection'

interface Injection {
  id: string
  userId: string
  site: string
  notes: string | null
  date: string
  createdAt: string
}

interface InjectionHistoryProps {
  userId: string
}

export function InjectionHistory({ userId }: InjectionHistoryProps) {
  const [injections, setInjections] = useState<Injection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/injections?userId=${userId}&limit=20`)

      if (!response.ok) {
        throw new Error('Failed to fetch injection history')
      }

      const data = await response.json()
      setInjections(data)
    } catch (err) {
      setError('Failed to load injection history')
      console.error('Error fetching injection history:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 text-lime animate-spin" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={fetchHistory}
          className="text-lime text-sm mt-2 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  // Empty state
  if (injections.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 text-center">
        <p className="text-muted-foreground">No injections logged yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {injections.map((injection) => {
        const date = new Date(injection.date)
        const formattedDate = format(date, 'EEEE, MMM d')
        const siteLabel = getSiteLabel(injection.site as InjectionSite)

        return (
          <div
            key={injection.id}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white font-medium">{formattedDate}</p>
                <p className="text-sm text-muted-foreground mt-1">{siteLabel}</p>
                {injection.notes && (
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    {injection.notes}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
