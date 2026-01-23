'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressCalendar } from '@/components/calendar/ProgressCalendar'

export default function CalendarPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    if (!storedUserId) {
      router.replace('/')
      return
    }

    setUserId(storedUserId)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="px-6 py-6 max-w-5xl mx-auto">
          {/* Header skeleton */}
          <header className="mb-6">
            <div className="h-8 bg-white/5 rounded animate-pulse w-48 mb-2" />
            <div className="h-4 bg-white/5 rounded animate-pulse w-64" />
          </header>

          {/* Calendar skeleton */}
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-white/5 rounded animate-pulse w-32" />
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-white/5 rounded animate-pulse" />
                <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
                <div className="h-8 w-8 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-1">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-6 bg-white/5 rounded animate-pulse"
                  />
                ))}
              </div>
              {/* Calendar grid */}
              {Array.from({ length: 5 }).map((_, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }).map((_, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="aspect-square bg-white/5 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!userId) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="px-6 py-6 max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-white">
            Progress Calendar
          </h1>
          <p className="text-muted-foreground text-sm">
            View your journey at a glance
          </p>
        </header>

        {/* Calendar */}
        <ProgressCalendar userId={userId} />
      </div>
    </main>
  )
}
