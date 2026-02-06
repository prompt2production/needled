/**
 * Dose tracking configuration for flexible pen sizes and golden dose support.
 */
export interface DoseTrackingConfig {
  dosesPerPen: number
  tracksGoldenDose: boolean
  wasGoldenDose?: boolean
}

/**
 * Default configuration for standard 4-dose pens.
 */
export const DEFAULT_DOSE_CONFIG: DoseTrackingConfig = {
  dosesPerPen: 4,
  tracksGoldenDose: false,
}

/**
 * Calculate the next dose number based on the last injection's dose number.
 *
 * Standard flow: 1 → 2 → 3 → 4 → 1 (new pen)
 * With golden dose: 1 → 2 → 3 → 4 → 5 (golden) → 1 (new pen)
 *
 * @param lastDoseNumber - The dose number from the most recent injection, or null if no previous injection
 * @param config - Dose tracking configuration (optional, defaults to 4-dose pen without golden dose)
 * @returns The next dose number
 */
export function getNextDoseNumber(
  lastDoseNumber: number | null,
  config: DoseTrackingConfig = DEFAULT_DOSE_CONFIG
): number {
  if (lastDoseNumber == null) {
    return 1
  }

  // If last dose was a golden dose, start new pen
  if (config.wasGoldenDose) {
    return 1
  }

  // If at last standard dose and tracking golden dose, next is golden (dosesPerPen + 1)
  if (lastDoseNumber >= config.dosesPerPen) {
    if (config.tracksGoldenDose && lastDoseNumber === config.dosesPerPen) {
      return config.dosesPerPen + 1 // Golden dose
    }
    return 1 // New pen
  }

  return lastDoseNumber + 1
}

/**
 * Calculate remaining standard doses based on the next dose to take.
 * This counts only standard doses, not the golden dose.
 *
 * @param nextDose - The next dose number to take
 * @param dosesPerPen - Number of standard doses per pen
 * @returns Number of standard doses remaining (including the next dose)
 */
export function getStandardDosesRemaining(nextDose: number, dosesPerPen: number): number {
  // If nextDose is beyond standard doses (golden dose position), no standard doses remain
  if (nextDose > dosesPerPen) {
    return 0
  }
  // Calculate: dosesPerPen - nextDose + 1
  // e.g., nextDose=3, dosesPerPen=4 → 4 - 3 + 1 = 2 (doses 3 and 4 remaining)
  return Math.max(0, dosesPerPen - nextDose + 1)
}

/**
 * Calculate how many doses remain in the current pen.
 *
 * @param currentDose - The current dose number (last taken), or null if no doses taken
 * @param config - Dose tracking configuration
 * @returns Number of doses remaining (including golden dose if tracked)
 */
export function getDosesRemaining(
  currentDose: number | null,
  config: DoseTrackingConfig = DEFAULT_DOSE_CONFIG
): number {
  if (currentDose === null) {
    return config.dosesPerPen + (config.tracksGoldenDose ? 1 : 0)
  }

  // If on golden dose or past it, pen is complete
  if (currentDose > config.dosesPerPen) {
    return config.dosesPerPen + (config.tracksGoldenDose ? 1 : 0)
  }

  const remaining = config.dosesPerPen - currentDose
  // Add golden dose if tracking and haven't taken it yet
  if (config.tracksGoldenDose) {
    return remaining + 1
  }
  return remaining
}

/**
 * Check if a golden dose is available to take.
 * Golden dose is available when all standard doses are taken.
 *
 * @param currentDose - The current dose number (last taken), or null
 * @param config - Dose tracking configuration
 * @returns True if golden dose can be taken
 */
export function isGoldenDoseAvailable(
  currentDose: number | null,
  config: DoseTrackingConfig = DEFAULT_DOSE_CONFIG
): boolean {
  if (!config.tracksGoldenDose) {
    return false
  }
  if (currentDose === null) {
    return false
  }
  // Golden dose is available when at the last standard dose
  return currentDose === config.dosesPerPen
}

/**
 * Check if the user is currently on (has just taken) a golden dose.
 *
 * @param currentDose - The current dose number (last taken), or null
 * @param config - Dose tracking configuration
 * @returns True if user just took a golden dose
 */
export function isOnGoldenDose(
  currentDose: number | null,
  config: DoseTrackingConfig = DEFAULT_DOSE_CONFIG
): boolean {
  if (!config.tracksGoldenDose || currentDose === null) {
    return false
  }
  return currentDose === config.dosesPerPen + 1
}

/**
 * Check if the next dose to take will be a golden dose.
 *
 * @param currentDose - The current dose number (last taken), or null
 * @param config - Dose tracking configuration
 * @returns True if the next injection will be a golden dose
 */
export function isNextDoseGolden(
  currentDose: number | null,
  config: DoseTrackingConfig = DEFAULT_DOSE_CONFIG
): boolean {
  if (!config.tracksGoldenDose) {
    return false
  }
  if (currentDose === null) {
    return false
  }
  // Next dose is golden when at the last standard dose
  return currentDose === config.dosesPerPen
}

/**
 * Calculate the number of doses per pen based on pen strength and dose amount.
 * Used for microdosing calculations.
 *
 * @param penStrengthMg - Total medication in pen (mg)
 * @param doseAmountMg - Amount per dose (mg)
 * @returns Number of full doses that can be extracted
 */
export function calculateDosesPerPen(penStrengthMg: number, doseAmountMg: number): number {
  if (doseAmountMg <= 0) {
    return 1
  }
  return Math.floor(penStrengthMg / doseAmountMg)
}
