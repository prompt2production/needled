const KG_TO_LBS = 2.20462

export function kgToLbs(kg: number): number {
  return kg * KG_TO_LBS
}

export function lbsToKg(lbs: number): number {
  return lbs / KG_TO_LBS
}

export function formatWeight(weight: number, unit: 'kg' | 'lbs'): string {
  return `${weight.toFixed(1)} ${unit}`
}
