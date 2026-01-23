'use client'

import { useState, useEffect, useCallback } from 'react'
import { Droplets, Utensils, Dumbbell } from 'lucide-react'
import { toast } from 'sonner'
import { HabitRow } from './HabitRow'
import type { HabitType } from '@/lib/validations/habit'

interface HabitData {
  id: string
  date: string
  water: boolean
  nutrition: boolean
  exercise: boolean
}

interface HabitsCardProps {
  userId: string
}

const HABIT_LABELS: Record<HabitType, string> = {
  water: 'Water',
  nutrition: 'Nutrition',
  exercise: 'Exercise',
}

export function HabitsCard({ userId }: HabitsCardProps) {
  const [habits, setHabits] = useState<HabitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<HabitType | null>(null)

  const fetchHabits = useCallback(async () => {
    try {
      const response = await fetch(`/api/habits/today?userId=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch habits')
      const data = await response.json()
      setHabits(data)
    } catch (error) {
      console.error('Failed to fetch habits:', error)
      toast.error('Failed to load habits')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  const handleToggle = async (habit: HabitType, value: boolean) => {
    setToggling(habit)

    // Optimistic update
    if (habits) {
      setHabits({ ...habits, [habit]: value })
    }

    try {
      const response = await fetch('/api/habits/today', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, habit, value }),
      })

      if (!response.ok) throw new Error('Failed to toggle habit')

      const data = await response.json()
      setHabits(data)

      const label = HABIT_LABELS[habit]
      if (value) {
        toast.success(`${label} logged`)
      } else {
        toast.success(`${label} removed`)
      }
    } catch (error) {
      console.error('Failed to toggle habit:', error)
      toast.error('Failed to update habit')
      // Revert optimistic update
      fetchHabits()
    } finally {
      setToggling(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-base font-medium text-white mb-4">Daily Habits</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="h-8 w-8 bg-white/5 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="text-base font-medium text-white mb-4">Daily Habits</h3>

      <div className="divide-y divide-border">
        <HabitRow
          habit="water"
          label="Water"
          icon={Droplets}
          checked={habits?.water ?? false}
          onToggle={handleToggle}
          disabled={toggling === 'water'}
        />
        <HabitRow
          habit="nutrition"
          label="Nutrition"
          icon={Utensils}
          checked={habits?.nutrition ?? false}
          onToggle={handleToggle}
          disabled={toggling === 'nutrition'}
        />
        <HabitRow
          habit="exercise"
          label="Exercise"
          icon={Dumbbell}
          checked={habits?.exercise ?? false}
          onToggle={handleToggle}
          disabled={toggling === 'exercise'}
        />
      </div>
    </div>
  )
}
