'use client'

import { useState, useEffect } from 'react'
import { InjectionCardConnected } from '@/components/injection/InjectionCardConnected'
import { InjectionHistory } from '@/components/injection/InjectionHistory'
import { DosesRemainingCard } from '@/components/injection/DosesRemainingCard'

interface User {
  id: string
  name: string
  medication: string
  injectionDay: number
}

interface InjectionStatus {
  currentDose: number | null
  dosesRemaining: number
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
  const [injectionStatus, setInjectionStatus] = useState<InjectionStatus | null>(null)
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

        // Fetch injection status for dose tracking
        const statusResponse = await fetch(`/api/injections/status?userId=${userId}`)
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          setInjectionStatus({
            currentDose: statusData.currentDose,
            dosesRemaining: statusData.dosesRemaining,
          })
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

          {/* Doses Remaining and History - side by side on desktop */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Doses Remaining Card */}
            {injectionStatus && (
              <DosesRemainingCard
                currentDose={injectionStatus.currentDose}
                dosesRemaining={injectionStatus.dosesRemaining}
              />
            )}

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
