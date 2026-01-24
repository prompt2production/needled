/**
 * Calculate the next dose number based on the last injection's dose number.
 * Doses cycle 1 → 2 → 3 → 4 → 1 (new pen)
 *
 * @param lastDoseNumber - The dose number from the most recent injection (1-4), or null if no previous injection
 * @returns The next dose number (1-4)
 */
export function getNextDoseNumber(lastDoseNumber: number | null): number {
  if (lastDoseNumber == null) {
    return 1
  }
  if (lastDoseNumber >= 4) {
    return 1
  }
  return lastDoseNumber + 1
}
