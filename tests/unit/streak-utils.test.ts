import { describe, it, expect } from 'vitest'
import { isPerfectDay, calculateStreaks } from '@/lib/streak-utils'

describe('isPerfectDay', () => {
  it('should return true when all habits are completed', () => {
    expect(isPerfectDay({ water: true, nutrition: true, exercise: true })).toBe(true)
  })

  it('should return false when any habit is incomplete', () => {
    expect(isPerfectDay({ water: false, nutrition: true, exercise: true })).toBe(false)
    expect(isPerfectDay({ water: true, nutrition: false, exercise: true })).toBe(false)
    expect(isPerfectDay({ water: true, nutrition: true, exercise: false })).toBe(false)
  })

  it('should return false for undefined or null', () => {
    expect(isPerfectDay(undefined)).toBe(false)
    expect(isPerfectDay(null)).toBe(false)
  })
})

describe('calculateStreaks', () => {
  it('should return zeros for empty habit map', () => {
    const habitMap = new Map()
    const result = calculateStreaks(habitMap, new Date('2024-01-15'))

    expect(result.currentStreak).toBe(0)
    expect(result.bestStreak).toBe(0)
    expect(result.streakDayNumbers.size).toBe(0)
  })

  it('should not count a single perfect day as a streak', () => {
    const habitMap = new Map([
      ['2024-01-10', { water: true, nutrition: true, exercise: true }],
    ])
    const result = calculateStreaks(habitMap, new Date('2024-01-15'))

    expect(result.currentStreak).toBe(0)
    expect(result.bestStreak).toBe(0)
    expect(result.streakDayNumbers.size).toBe(0)
  })

  it('should count two consecutive perfect days as a streak', () => {
    const habitMap = new Map([
      ['2024-01-10', { water: true, nutrition: true, exercise: true }],
      ['2024-01-11', { water: true, nutrition: true, exercise: true }],
    ])
    const result = calculateStreaks(habitMap, new Date('2024-01-15'))

    expect(result.bestStreak).toBe(2)
    expect(result.streakDayNumbers.get('2024-01-10')).toBe(1)
    expect(result.streakDayNumbers.get('2024-01-11')).toBe(2)
  })

  it('should track multiple separate streaks', () => {
    const habitMap = new Map([
      ['2024-01-10', { water: true, nutrition: true, exercise: true }],
      ['2024-01-11', { water: true, nutrition: true, exercise: true }],
      ['2024-01-12', { water: false, nutrition: true, exercise: true }], // Break
      ['2024-01-13', { water: true, nutrition: true, exercise: true }],
      ['2024-01-14', { water: true, nutrition: true, exercise: true }],
      ['2024-01-15', { water: true, nutrition: true, exercise: true }],
    ])
    const result = calculateStreaks(habitMap, new Date('2024-01-20'))

    expect(result.bestStreak).toBe(3)
    expect(result.streakDayNumbers.get('2024-01-13')).toBe(1)
    expect(result.streakDayNumbers.get('2024-01-14')).toBe(2)
    expect(result.streakDayNumbers.get('2024-01-15')).toBe(3)
  })

  it('should identify current streak when ending today', () => {
    const today = new Date('2024-01-15')
    const habitMap = new Map([
      ['2024-01-13', { water: true, nutrition: true, exercise: true }],
      ['2024-01-14', { water: true, nutrition: true, exercise: true }],
      ['2024-01-15', { water: true, nutrition: true, exercise: true }],
    ])
    const result = calculateStreaks(habitMap, today)

    expect(result.currentStreak).toBe(3)
    expect(result.bestStreak).toBe(3)
  })

  it('should identify current streak when ending yesterday', () => {
    const today = new Date('2024-01-15')
    const habitMap = new Map([
      ['2024-01-13', { water: true, nutrition: true, exercise: true }],
      ['2024-01-14', { water: true, nutrition: true, exercise: true }],
    ])
    const result = calculateStreaks(habitMap, today)

    expect(result.currentStreak).toBe(2)
  })

  it('should not count old streak as current', () => {
    const today = new Date('2024-01-20')
    const habitMap = new Map([
      ['2024-01-10', { water: true, nutrition: true, exercise: true }],
      ['2024-01-11', { water: true, nutrition: true, exercise: true }],
      ['2024-01-12', { water: true, nutrition: true, exercise: true }],
    ])
    const result = calculateStreaks(habitMap, today)

    expect(result.currentStreak).toBe(0) // Old streak, not active
    expect(result.bestStreak).toBe(3) // But it's still the best
  })

  it('should handle non-consecutive dates', () => {
    const habitMap = new Map([
      ['2024-01-10', { water: true, nutrition: true, exercise: true }],
      ['2024-01-12', { water: true, nutrition: true, exercise: true }], // Skipped 11
      ['2024-01-13', { water: true, nutrition: true, exercise: true }],
    ])
    const result = calculateStreaks(habitMap, new Date('2024-01-20'))

    expect(result.bestStreak).toBe(2) // Only 12-13 are consecutive
    expect(result.streakDayNumbers.has('2024-01-10')).toBe(false) // Not part of streak
    expect(result.streakDayNumbers.get('2024-01-12')).toBe(1)
    expect(result.streakDayNumbers.get('2024-01-13')).toBe(2)
  })
})
