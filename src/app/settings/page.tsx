'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { NotificationSettings } from '@/components/notifications/NotificationSettings'

interface UserData {
  id: string
  name: string
  email: string | null
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/session')
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
  }, [])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-lime animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="pt-16 px-6">
        <div className="max-w-5xl mx-auto py-6">
          {/* Page header */}
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-white">Settings</h1>
            <p className="text-muted-foreground text-sm">Manage your notification preferences</p>
          </header>

          {/* Notification settings */}
          <div className="max-w-xl">
            <NotificationSettings hasEmail={!!user?.email} />
          </div>
        </div>
      </div>
    </main>
  )
}
