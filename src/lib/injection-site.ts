import type { InjectionSite } from '@/lib/validations/injection'

/**
 * Rotation order for injection sites.
 * This is a recommended pattern to ensure even distribution and healing time.
 */
export const SITE_ROTATION_ORDER: InjectionSite[] = [
  'ABDOMEN_LEFT',
  'ABDOMEN_RIGHT',
  'THIGH_LEFT',
  'THIGH_RIGHT',
  'UPPER_ARM_LEFT',
  'UPPER_ARM_RIGHT',
]

/**
 * Human-readable labels for injection sites.
 */
const SITE_LABELS: Record<InjectionSite, string> = {
  ABDOMEN_LEFT: 'Left Abdomen',
  ABDOMEN_RIGHT: 'Right Abdomen',
  THIGH_LEFT: 'Left Thigh',
  THIGH_RIGHT: 'Right Thigh',
  UPPER_ARM_LEFT: 'Left Upper Arm',
  UPPER_ARM_RIGHT: 'Right Upper Arm',
}

/**
 * Get the next site in the rotation order.
 * If lastSite is null or undefined, returns the first site (ABDOMEN_LEFT).
 *
 * @param lastSite - The last injection site used, or null for first injection
 * @returns The next site in the rotation
 */
export function getNextSite(lastSite: InjectionSite | null): InjectionSite {
  if (lastSite == null) {
    return SITE_ROTATION_ORDER[0]
  }

  const currentIndex = SITE_ROTATION_ORDER.indexOf(lastSite)

  if (currentIndex === -1) {
    // Unknown site, start from beginning
    return SITE_ROTATION_ORDER[0]
  }

  // Get next site in rotation, wrapping around to start if at end
  const nextIndex = (currentIndex + 1) % SITE_ROTATION_ORDER.length
  return SITE_ROTATION_ORDER[nextIndex]
}

/**
 * Get a human-readable label for an injection site.
 *
 * @param site - The injection site
 * @returns Human-readable label (e.g., 'Left Abdomen')
 */
export function getSiteLabel(site: InjectionSite): string {
  return SITE_LABELS[site]
}
