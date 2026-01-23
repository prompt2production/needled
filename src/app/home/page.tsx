'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Scale, Syringe, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/navigation/BottomNav'

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
      <div className="px-4 pt-safe pb-24">
        {/* Header */}
        <header className="py-6">
          <h1 className="text-2xl font-semibold text-white">
            Hey, {user.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Let's check in on your journey
          </p>
        </header>

        {/* Quick Actions */}
        <div className="space-y-4">
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

          <div className="bg-card rounded-xl border border-border p-4 opacity-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                <Syringe className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">Injection Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
