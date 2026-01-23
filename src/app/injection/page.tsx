'use client'

import { useState, useEffect } from 'react'
import { InjectionCardConnected } from '@/components/injection/InjectionCardConnected'
import { InjectionHistory } from '@/components/injection/InjectionHistory'
import { SITE_ROTATION_ORDER, getSiteLabel } from '@/lib/injection-site'
import type { InjectionSite } from '@/lib/validations/injection'

interface User {
  id: string
  name: string
  medication: string
  injectionDay: number
}

interface Injection {
  id: string
  site: string
  date: string
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const MEDICATION_NAMES: Record<string, string> = {
  OZEMPIC: 'Ozempic',
  WEGOVY: 'Wegovy',
  MOUNJARO: 'Mounjaro',
  ZEPBOUND: 'Zepbound',
  OTHER: 'medication',
}

export default function InjectionPage() {
  const [user, setUser] = useState<User | null>(null)
  const [recentInjections, setRecentInjections] = useState<Injection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      window.location.href = '/onboarding'
      return
    }

    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch(`/api/users/${userId}`)
        if (!userResponse.ok) throw new Error('Failed to fetch user')
        const userData = await userResponse.json()
        setUser(userData)

        // Fetch recent injections for site rotation summary
        const injectionsResponse = await fetch(`/api/injections?userId=${userId}&limit=6`)
        if (injectionsResponse.ok) {
          const injectionsData = await injectionsResponse.json()
          setRecentInjections(injectionsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading || !user) {
    return (
      <main className="min-h-screen bg-background">
        <div className="px-6 py-6 max-w-5xl mx-auto">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-white/5 rounded-lg w-24" />
            <div className="h-32 bg-white/5 rounded-xl" />
            <div className="h-20 bg-white/5 rounded-xl" />
          </div>
        </div>
      </main>
    )
  }

  // Calculate which sites have been used recently
  const recentSites = new Set(recentInjections.map(inj => inj.site))

  return (
    <main className="min-h-screen bg-background">
      <div className="px-6 py-6 max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-white">Injection</h1>
        </header>

        {/* Main content */}
        <div className="space-y-6">
          {/* Injection Card - full width */}
          <InjectionCardConnected
            userId={user.id}
            medicationName={MEDICATION_NAMES[user.medication] || 'medication'}
            injectionDayName={DAY_NAMES[user.injectionDay]}
          />

          {/* Site Rotation and History - side by side on desktop */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Site Rotation Summary */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="text-sm text-muted-foreground mb-3">Site Rotation</h3>
              <div className="grid grid-cols-3 gap-2">
                {SITE_ROTATION_ORDER.map((site) => {
                  const isRecentlyUsed = recentSites.has(site)
                  const label = getSiteLabel(site)

                  return (
                    <div
                      key={site}
                      className={`px-3 py-2 rounded-lg text-center text-sm ${
                        isRecentlyUsed
                          ? 'bg-lime/10 text-lime border border-lime/20'
                          : 'bg-white/5 text-muted-foreground'
                      }`}
                    >
                      {label}
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Highlighted sites were used in recent injections
              </p>
            </div>

            {/* History */}
            <div>
              <h3 className="text-sm text-muted-foreground mb-3">History</h3>
              <InjectionHistory userId={user.id} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
