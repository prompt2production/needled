'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CalendarDayResponse } from '@/lib/validations/calendar'

interface UseCalendarDayResult {
  data: CalendarDayResponse | null
  loading: boolean
  error: string | null
}

export function useCalendarDay(date: string | null, userId: string): UseCalendarDayResult {
  const [data, setData] = useState<CalendarDayResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!date) {
      setData(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/calendar/day/${date}?userId=${userId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch day data')
      }

      const result: CalendarDayResponse = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [date, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error }
}
