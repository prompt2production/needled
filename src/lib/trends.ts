/**
 * Calculate the week-over-week weight change
 * Returns null if there's no previous weight to compare
 */
export function calculateWeekChange(
  current: number,
  previous: number | null
): number | null {
  if (previous === null) return null
  return Number((current - previous).toFixed(1))
}

/**
 * Calculate total weight change from starting weight
 */
export function calculateTotalChange(
  current: number,
  startWeight: number
): number {
  return Number((current - startWeight).toFixed(1))
}

/**
 * Calculate progress percentage toward goal
 * Returns null if no goal weight is set
 * Returns percentage of total weight loss achieved (0-100+)
 */
export function calculateProgress(
  current: number,
  start: number,
  goal: number | null
): number | null {
  if (goal === null) return null

  const targetLoss = start - goal
  if (targetLoss <= 0) return null // Invalid: goal >= start

  const actualLoss = start - current
  const percentage = (actualLoss / targetLoss) * 100

  return Number(percentage.toFixed(1))
}
