'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Scale, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { InjectionCardConnected } from '@/components/injection/InjectionCardConnected'
import { HabitsCard } from '@/components/habits/HabitsCard'

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const MEDICATION_NAMES: Record<string, string> = {
  OZEMPIC: 'Ozempic',
  WEGOVY: 'Wegovy',
  MOUNJARO: 'Mounjaro',
  ZEPBOUND: 'Zepbound',
  OTHER: 'medication',
}

interface User {
  id: string
  name: string
  startWeight: number
  goalWeight: number | null
  weightUnit: 'kg' | 'lbs'
  medication: string
  injectionDay: number
}

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      router.replace('/')
      return
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`)
        if (!response.ok) throw new Error('Failed to fetch user')
        const userData = await response.json()
        setUser(userData)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-lime animate-spin" />
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="px-6 py-6 max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-white">
            Hey, {user.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Let's check in on your journey
          </p>
        </header>

        {/* Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-6">
            <Link
              href="/weigh-in"
              className="block bg-card rounded-xl border border-border p-4 hover:bg-card-elevated transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-lime/10 flex items-center justify-center">
                  <Scale className="h-6 w-6 text-lime" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">Weekly Weigh-in</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your progress
                  </p>
                </div>
              </div>
            </Link>

            <InjectionCardConnected
              userId={user.id}
              medicationName={MEDICATION_NAMES[user.medication] || 'medication'}
              injectionDayName={DAY_NAMES[user.injectionDay]}
            />
          </div>

          {/* Right column */}
          <div>
            <HabitsCard userId={user.id} />
          </div>
        </div>
      </div>
    </main>
  )
}
