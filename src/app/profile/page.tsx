'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserData {
  id: string
  name: string
  startWeight: number
  goalWeight: number | null
  weightUnit: 'kg' | 'lbs'
  medication: string
  injectionDay: number
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
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

  const handleLogout = () => {
    localStorage.removeItem('userId')
    router.replace('/')
  }

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
          <h1 className="text-2xl font-semibold text-white">Profile</h1>
        </header>

        {/* Profile Info - centered with max-width for readability */}
        <div className="max-w-xl mx-auto space-y-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-lime/10 flex items-center justify-center">
                <User className="h-7 w-7 text-lime" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-white">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.medication}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Starting weight</span>
                <span className="text-sm text-white">
                  {user.startWeight} {user.weightUnit}
                </span>
              </div>
              {user.goalWeight && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Goal weight</span>
                  <span className="text-sm text-white">
                    {user.goalWeight} {user.weightUnit}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Injection day</span>
                <span className="text-sm text-white">{DAYS[user.injectionDay]}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full h-12 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Log out
          </Button>
        </div>
      </div>
    </main>
  )
}
