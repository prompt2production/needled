import { describe, it, expect } from 'vitest'
import {
  calculateWeekChange,
  calculateTotalChange,
  calculateProgress,
} from '@/lib/trends'

describe('trend utilities', () => {
  describe('calculateWeekChange', () => {
    it('should return difference between current and previous weight', () => {
      expect(calculateWeekChange(85, 87)).toBe(-2)
      expect(calculateWeekChange(87, 85)).toBe(2)
    })

    it('should return null when previous is null', () => {
      expect(calculateWeekChange(85, null)).toBeNull()
    })

    it('should return 0 when weights are the same', () => {
      expect(calculateWeekChange(85, 85)).toBe(0)
    })

    it('should round to 1 decimal place', () => {
      expect(calculateWeekChange(85.33, 87.67)).toBe(-2.3)
    })
  })

  describe('calculateTotalChange', () => {
    it('should return difference from starting weight (weight loss)', () => {
      expect(calculateTotalChange(85, 90)).toBe(-5)
    })

    it('should return difference from starting weight (weight gain)', () => {
      expect(calculateTotalChange(92, 90)).toBe(2)
    })

    it('should return 0 when weight is same as start', () => {
      expect(calculateTotalChange(90, 90)).toBe(0)
    })

    it('should round to 1 decimal place', () => {
      expect(calculateTotalChange(85.33, 90.67)).toBe(-5.3)
    })
  })

  describe('calculateProgress', () => {
    it('should return percentage of goal achieved', () => {
      // Start: 100, Goal: 80, Current: 90 -> 50% of way there
      expect(calculateProgress(90, 100, 80)).toBe(50)
    })

    it('should return 100% when goal is reached', () => {
      expect(calculateProgress(80, 100, 80)).toBe(100)
    })

    it('should return 0% when no progress made', () => {
      expect(calculateProgress(100, 100, 80)).toBe(0)
    })

    it('should return over 100% when exceeded goal', () => {
      // Start: 100, Goal: 80, Current: 75 -> exceeded goal
      expect(calculateProgress(75, 100, 80)).toBe(125)
    })

    it('should return negative when gained weight', () => {
      expect(calculateProgress(105, 100, 80)).toBe(-25)
    })

    it('should return null when goal is null', () => {
      expect(calculateProgress(85, 100, null)).toBeNull()
    })

    it('should return null when goal equals start', () => {
      expect(calculateProgress(95, 100, 100)).toBeNull()
    })

    it('should return null when goal is greater than start', () => {
      expect(calculateProgress(95, 100, 110)).toBeNull()
    })

    it('should round to 1 decimal place', () => {
      // Start: 100, Goal: 70, Current: 85 -> 50% of 30kg = 15kg loss
      expect(calculateProgress(85, 100, 70)).toBe(50)

      // More complex: Start: 95.5, Goal: 75.5, Current: 85.5
      // Target loss: 20, Actual loss: 10 -> 50%
      expect(calculateProgress(85.5, 95.5, 75.5)).toBe(50)
    })
  })
})
