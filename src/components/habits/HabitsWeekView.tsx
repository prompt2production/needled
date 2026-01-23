'use client'

import { useState, useEffect, useCallback } from 'react'
import { Droplets, Utensils, Dumbbell } from 'lucide-react'
import { toast } from 'sonner'
import { HabitWeekGrid } from './HabitWeekGrid'
import { getWeekDates, getDateString } from '@/lib/habit-dates'
import type { HabitType } from '@/lib/validations/habit'

interface HabitData {
  id: string
  date: string
  water: boolean
  nutrition: boolean
  exercise: boolean
}

interface HabitsWeekViewProps {
  userId: string
}

export function HabitsWeekView({ userId }: HabitsWeekViewProps) {
  const [habits, setHabits] = useState<HabitData[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<HabitType | null>(null)

  const today = getDateString(new Date())
  const weekDates = getWeekDates(new Date())

  const fetchHabits = useCallback(async () => {
    try {
      const startDate = getDateString(weekDates[0])
      const endDate = getDateString(weekDates[6])

      const response = await fetch(
        `/api/habits?userId=${userId}&startDate=${startDate}&endDate=${endDate}`
      )
      if (!response.ok) throw new Error('Failed to fetch habits')
      const data = await response.json()
      setHabits(data)
    } catch (error) {
      console.error('Failed to fetch habits:', error)
      toast.error('Failed to load habits')
    } finally {
      setLoading(false)
    }
  }, [userId, weekDates])

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  const handleToggle = async (habit: HabitType, value: boolean) => {
    setToggling(habit)

    try {
      const response = await fetch('/api/habits/today', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, habit, value }),
      })

      if (!response.ok) throw new Error('Failed to toggle habit')

      // Refetch to get updated data
      await fetchHabits()

      const labels: Record<HabitType, string> = {
        water: 'Water',
        nutrition: 'Nutrition',
        exercise: 'Exercise',
      }
      if (value) {
        toast.success(`${labels[habit]} logged`)
      } else {
        toast.success(`${labels[habit]} removed`)
      }
    } catch (error) {
      console.error('Failed to toggle habit:', error)
      toast.error('Failed to update habit')
    } finally {
      setToggling(null)
    }
  }

  // Create week data for each habit
  const getWeekData = (habit: HabitType) => {
    return weekDates.map((date) => {
      const dateString = getDateString(date)
      const habitData = habits.find(
        (h) => getDateString(new Date(h.date)) === dateString
      )
      return {
        date: dateString,
        completed: habitData?.[habit] ?? false,
      }
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex items-center gap-2 w-24">
              <div className="h-4 w-4 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                <div
                  key={j}
                  className="h-8 w-8 bg-white/5 rounded-full animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <HabitWeekGrid
        habit="water"
        label="Water"
        icon={Droplets}
        weekData={getWeekData('water')}
        today={today}
        onTodayToggle={handleToggle}
      />
      <HabitWeekGrid
        habit="nutrition"
        label="Nutrition"
        icon={Utensils}
        weekData={getWeekData('nutrition')}
        today={today}
        onTodayToggle={handleToggle}
      />
      <HabitWeekGrid
        habit="exercise"
        label="Exercise"
        icon={Dumbbell}
        weekData={getWeekData('exercise')}
        today={today}
        onTodayToggle={handleToggle}
      />
    </div>
  )
}
