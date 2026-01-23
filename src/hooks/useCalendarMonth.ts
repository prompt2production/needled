'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CalendarMonthResponse } from '@/lib/validations/calendar'

interface UseCalendarMonthResult {
  data: CalendarMonthResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useCalendarMonth(year: number, month: number, userId: string): UseCalendarMonthResult {
  const [data, setData] = useState<CalendarMonthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/calendar/${year}/${month}?userId=${userId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch calendar data')
      }

      const result: CalendarMonthResponse = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [year, month, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}
