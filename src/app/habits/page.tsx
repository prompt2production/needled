'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HabitsCard } from '@/components/habits/HabitsCard'
import { HabitsWeekView } from '@/components/habits/HabitsWeekView'

interface User {
  id: string
  name: string
}

export default function HabitsPage() {
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

  if (isLoading || !user) {
    return (
      <main className="min-h-screen bg-background">
        <div className="px-6 py-6 max-w-5xl mx-auto">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-white/5 rounded-lg w-24" />
            <div className="h-40 bg-white/5 rounded-xl" />
            <div className="h-32 bg-white/5 rounded-xl" />
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
          <h1 className="text-2xl font-semibold text-white">Habits</h1>
        </header>

        {/* Main content */}
        <div className="space-y-6">
          {/* Today's Habits */}
          <HabitsCard userId={user.id} />

          {/* Weekly Overview */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="text-sm text-muted-foreground mb-4">This Week</h3>
            <HabitsWeekView userId={user.id} />
          </div>
        </div>
      </div>
    </main>
  )
}
