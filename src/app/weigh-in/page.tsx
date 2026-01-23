'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Scale, TrendingDown, TrendingUp } from 'lucide-react'
import { WeighInCardConnected } from '@/components/weigh-in'
import { calculateProgress } from '@/lib/trends'

interface User {
  id: string
  name: string
  startWeight: number
  goalWeight: number | null
  weightUnit: 'kg' | 'lbs'
}

interface WeighIn {
  id: string
  weight: number
  date: string
}

interface LatestWeighInResponse {
  weighIn: {
    id: string
    weight: number
    date: string
  } | null
  weekChange: number | null
  totalChange: number | null
  canWeighIn: boolean
}

export default function WeighInPage() {
  const [user, setUser] = useState<User | null>(null)
  const [weighIns, setWeighIns] = useState<WeighIn[]>([])
  const [latestData, setLatestData] = useState<LatestWeighInResponse | null>(null)
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

        // Fetch weigh-ins
        const weighInsResponse = await fetch(`/api/weigh-ins?userId=${userId}&limit=10`)
        if (weighInsResponse.ok) {
          const weighInsData = await weighInsResponse.json()
          setWeighIns(weighInsData)
        }

        // Fetch latest with trend data
        const latestResponse = await fetch(`/api/weigh-ins/latest?userId=${userId}`)
        if (latestResponse.ok) {
          const latestData = await latestResponse.json()
          setLatestData(latestData)
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

  const progress = latestData?.weighIn
    ? calculateProgress(latestData.weighIn.weight, user.startWeight, user.goalWeight)
    : null

  return (
    <main className="min-h-screen bg-background">
      <div className="px-6 py-6 max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-white">Weight</h1>
        </header>

        {/* Main content */}
        <div className="space-y-6">
          {/* WeighIn Card - full width */}
          <WeighInCardConnected
            userId={user.id}
            weightUnit={user.weightUnit}
            startWeight={user.startWeight}
          />

          {/* Progress and History - side by side on desktop */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Progress Summary */}
            {latestData && latestData.totalChange !== null && (
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-sm text-muted-foreground mb-3">Progress</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {latestData.totalChange > 0 ? '+' : ''}
                      {latestData.totalChange?.toFixed(1)}
                      <span className="text-sm ml-1 text-muted-foreground">
                        {user.weightUnit}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total change
                    </p>
                  </div>
                  {progress !== null && (
                    <div>
                      <p className="text-2xl font-bold text-lime">
                        {progress.toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        To goal
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* History */}
            {weighIns.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-sm text-muted-foreground mb-3">History</h3>
                <div className="space-y-3">
                  {weighIns.map((weighIn, index) => {
                    const previousWeighIn = weighIns[index + 1]
                    const change = previousWeighIn
                      ? weighIn.weight - previousWeighIn.weight
                      : null

                    return (
                      <div
                        key={weighIn.id}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div>
                          <p className="text-sm text-white">
                            {format(new Date(weighIn.date), 'EEE d MMM')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {change !== null && change !== 0 && (
                            <span
                              className={`text-xs flex items-center gap-0.5 ${
                                change < 0 ? 'text-green-500' : 'text-red-500'
                              }`}
                            >
                              {change < 0 ? (
                                <TrendingDown className="h-3 w-3" />
                              ) : (
                                <TrendingUp className="h-3 w-3" />
                              )}
                              {change > 0 ? '+' : ''}
                              {change.toFixed(1)}
                            </span>
                          )}
                          <span className="text-white font-medium">
                            {weighIn.weight.toFixed(1)} {user.weightUnit}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Empty state */}
          {weighIns.length === 0 && !isLoading && (
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <Scale className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No weigh-ins yet. Log your first one above!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
