import { describe, it, expect } from 'vitest'
import { kgToLbs, lbsToKg, formatWeight } from '@/lib/weight'

describe('weight utilities', () => {
  describe('kgToLbs', () => {
    it('should convert kg to lbs', () => {
      expect(kgToLbs(1)).toBeCloseTo(2.20462, 4)
    })

    it('should convert 100kg to approximately 220.46 lbs', () => {
      expect(kgToLbs(100)).toBeCloseTo(220.462, 2)
    })

    it('should handle zero', () => {
      expect(kgToLbs(0)).toBe(0)
    })

    it('should handle decimal values', () => {
      expect(kgToLbs(0.5)).toBeCloseTo(1.10231, 4)
    })
  })

  describe('lbsToKg', () => {
    it('should convert lbs to kg', () => {
      expect(lbsToKg(2.20462)).toBeCloseTo(1, 4)
    })

    it('should convert 220 lbs to approximately 99.79 kg', () => {
      expect(lbsToKg(220)).toBeCloseTo(99.79, 1)
    })

    it('should handle zero', () => {
      expect(lbsToKg(0)).toBe(0)
    })

    it('should handle decimal values', () => {
      expect(lbsToKg(1.5)).toBeCloseTo(0.68039, 3)
    })

    it('should be inverse of kgToLbs', () => {
      const original = 75
      const converted = lbsToKg(kgToLbs(original))
      expect(converted).toBeCloseTo(original, 5)
    })
  })

  describe('formatWeight', () => {
    it('should format weight in kg with 1 decimal place', () => {
      expect(formatWeight(85.5, 'kg')).toBe('85.5 kg')
    })

    it('should format weight in lbs with 1 decimal place', () => {
      expect(formatWeight(188.5, 'lbs')).toBe('188.5 lbs')
    })

    it('should round to 1 decimal place', () => {
      expect(formatWeight(85.456, 'kg')).toBe('85.5 kg')
    })

    it('should add .0 for whole numbers', () => {
      expect(formatWeight(85, 'kg')).toBe('85.0 kg')
    })

    it('should handle small values', () => {
      expect(formatWeight(0.1, 'kg')).toBe('0.1 kg')
    })
  })
})
