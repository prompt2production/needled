interface HabitData {
  water: boolean
  nutrition: boolean
  exercise: boolean
}

export interface StreakInfo {
  currentStreak: number // Active streak length (0 if none)
  bestStreak: number // Longest streak this month
  streakDayNumbers: Map<string, number> // date -> day number in streak (1, 2, 3...)
}

/**
 * Check if all three habits are completed for a day
 */
export function isPerfectDay(habit: HabitData | undefined | null): boolean {
  if (!habit) return false
  return habit.water && habit.nutrition && habit.exercise
}

/**
 * Calculate streak information from habit data
 * @param habitMap Map of date strings (yyyy-MM-dd) to habit data
 * @param today Current date for determining active streak
 * @returns StreakInfo with current streak, best streak, and day numbers
 */
export function calculateStreaks(
  habitMap: Map<string, HabitData>,
  today: Date
): StreakInfo {
  const streakDayNumbers = new Map<string, number>()

  // Get all dates with habit data, sorted chronologically
  const dates = Array.from(habitMap.keys()).sort()

  if (dates.length === 0) {
    return { currentStreak: 0, bestStreak: 0, streakDayNumbers }
  }

  // Find all streaks and track the best one
  let bestStreak = 0
  let currentStreakLength = 0
  let currentStreakStart = -1
  const streaks: { start: number; length: number }[] = []

  for (let i = 0; i < dates.length; i++) {
    const dateStr = dates[i]
    const habit = habitMap.get(dateStr)
    const isPerfect = isPerfectDay(habit)

    if (isPerfect) {
      if (currentStreakStart === -1) {
        // Start a new streak
        currentStreakStart = i
        currentStreakLength = 1
      } else {
        // Check if this date is consecutive to the previous perfect day
        const prevDate = dates[i - 1]
        if (isConsecutive(prevDate, dateStr)) {
          currentStreakLength++
        } else {
          // Save the previous streak if it's 2+ days
          if (currentStreakLength >= 2) {
            streaks.push({ start: currentStreakStart, length: currentStreakLength })
            bestStreak = Math.max(bestStreak, currentStreakLength)
          }
          // Start a new streak
          currentStreakStart = i
          currentStreakLength = 1
        }
      }
    } else {
      // End current streak if there was one
      if (currentStreakLength >= 2) {
        streaks.push({ start: currentStreakStart, length: currentStreakLength })
        bestStreak = Math.max(bestStreak, currentStreakLength)
      }
      currentStreakStart = -1
      currentStreakLength = 0
    }
  }

  // Handle the final streak if we ended on a perfect day
  if (currentStreakLength >= 2) {
    streaks.push({ start: currentStreakStart, length: currentStreakLength })
    bestStreak = Math.max(bestStreak, currentStreakLength)
  }

  // Map streak day numbers for all streaks
  for (const streak of streaks) {
    for (let j = 0; j < streak.length; j++) {
      const dateStr = dates[streak.start + j]
      streakDayNumbers.set(dateStr, j + 1)
    }
  }

  // Determine current (active) streak
  // A streak is "active" if it includes today or yesterday
  const todayStr = formatDateString(today)
  const yesterdayStr = formatDateString(new Date(today.getTime() - 86400000))

  let currentStreak = 0

  // Find if there's an active streak
  for (const streak of streaks) {
    const streakEndIndex = streak.start + streak.length - 1
    const streakEndDate = dates[streakEndIndex]

    // Check if streak ends today, yesterday, or could continue to today
    if (streakEndDate === todayStr || streakEndDate === yesterdayStr) {
      currentStreak = streak.length
      break
    }
  }

  return { currentStreak, bestStreak, streakDayNumbers }
}

/**
 * Check if two date strings are consecutive days
 */
function isConsecutive(date1: string, date2: string): boolean {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffMs = d2.getTime() - d1.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays === 1
}

/**
 * Format a Date to yyyy-MM-dd string
 */
function formatDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
