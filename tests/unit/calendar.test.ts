import { describe, it, expect } from 'vitest'
import {
  calendarMonthParamsSchema,
  calendarDayParamsSchema,
  calendarMonthResponseSchema,
  calendarDayResponseSchema,
} from '@/lib/validations/calendar'

describe('Calendar Validation Schemas', () => {
  describe('calendarMonthParamsSchema', () => {
    describe('valid inputs', () => {
      it('should accept valid year and month', () => {
        const result = calendarMonthParamsSchema.safeParse({ year: 2026, month: 1 })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.year).toBe(2026)
          expect(result.data.month).toBe(1)
        }
      })

      it('should coerce string year and month to numbers', () => {
        const result = calendarMonthParamsSchema.safeParse({ year: '2026', month: '12' })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.year).toBe(2026)
          expect(result.data.month).toBe(12)
        }
      })

      it('should accept minimum year 1900', () => {
        const result = calendarMonthParamsSchema.safeParse({ year: 1900, month: 1 })
        expect(result.success).toBe(true)
      })

      it('should accept maximum year 2100', () => {
        const result = calendarMonthParamsSchema.safeParse({ year: 2100, month: 12 })
        expect(result.success).toBe(true)
      })

      it('should accept month 1 (January)', () => {
        const result = calendarMonthParamsSchema.safeParse({ year: 2026, month: 1 })
        expect(result.success).toBe(true)
      })

      it('should accept month 12 (December)', () => {
        const result = calendarMonthParamsSchema.safeParse({ year: 2026, month: 12 })
        expect(result.success).toBe(true)
      })
    })

    describe('invalid inputs', () => {
      it('should reject year below 1900', () => {
        const result = calendarMonthParamsSchema.safeParse({ year: 1899, month: 1 })
        expect(result.success).toBe(false)
      })

      it('should reject year above 2100', () => {
        const result = calendarMonthParamsSchema.safeParse({ year: 2101, month: 1 })
        expect(result.success).toBe(false)
      })

      it('should reject month 0', () => {
        const result = calendarMonthParamsSchema.safeParse({ year: 2026, month: 0 })
        expect(result.success).toBe(false)
      })

      it('should reject month 13', () => {
        const result = calendarMonthParamsSchema.safeParse({ year: 2026, month: 13 })
        expect(result.success).toBe(false)
      })

      it('should reject non-integer year', () => {
        const result = calendarMonthParamsSchema.safeParse({ year: 2026.5, month: 1 })
        expect(result.success).toBe(false)
      })

      it('should reject non-integer month', () => {
        const result = calendarMonthParamsSchema.safeParse({ year: 2026, month: 1.5 })
        expect(result.success).toBe(false)
      })

      it('should reject invalid string year', () => {
        const result = calendarMonthParamsSchema.safeParse({ year: 'invalid', month: 1 })
        expect(result.success).toBe(false)
      })

      it('should reject invalid string month', () => {
        const result = calendarMonthParamsSchema.safeParse({ year: 2026, month: 'invalid' })
        expect(result.success).toBe(false)
      })
    })
  })

  describe('calendarDayParamsSchema', () => {
    describe('valid inputs', () => {
      it('should accept valid ISO date string', () => {
        const result = calendarDayParamsSchema.safeParse({ date: '2026-01-23' })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.date).toBe('2026-01-23')
        }
      })

      it('should accept ISO date with time', () => {
        const result = calendarDayParamsSchema.safeParse({ date: '2026-01-23T10:30:00Z' })
        expect(result.success).toBe(true)
      })

      it('should accept date at start of year', () => {
        const result = calendarDayParamsSchema.safeParse({ date: '2026-01-01' })
        expect(result.success).toBe(true)
      })

      it('should accept date at end of year', () => {
        const result = calendarDayParamsSchema.safeParse({ date: '2026-12-31' })
        expect(result.success).toBe(true)
      })
    })

    describe('invalid inputs', () => {
      it('should reject invalid date string', () => {
        const result = calendarDayParamsSchema.safeParse({ date: 'invalid-date' })
        expect(result.success).toBe(false)
      })

      it('should reject empty string', () => {
        const result = calendarDayParamsSchema.safeParse({ date: '' })
        expect(result.success).toBe(false)
      })

      it('should reject date with invalid month', () => {
        const result = calendarDayParamsSchema.safeParse({ date: '2026-13-01' })
        expect(result.success).toBe(false)
      })

      it('should reject date with invalid day', () => {
        const result = calendarDayParamsSchema.safeParse({ date: '2026-01-32' })
        expect(result.success).toBe(false)
      })

      it('should reject non-string date', () => {
        const result = calendarDayParamsSchema.safeParse({ date: 20260123 })
        expect(result.success).toBe(false)
      })
    })
  })

  describe('calendarMonthResponseSchema', () => {
    it('should accept valid month response with all arrays empty', () => {
      const result = calendarMonthResponseSchema.safeParse({
        habits: [],
        weighIns: [],
        injections: [],
      })
      expect(result.success).toBe(true)
    })

    it('should accept valid month response with data', () => {
      const result = calendarMonthResponseSchema.safeParse({
        habits: [
          { date: '2026-01-23', water: true, nutrition: false, exercise: true },
        ],
        weighIns: [
          { date: '2026-01-23', weight: 85.5 },
        ],
        injections: [
          { date: '2026-01-23', site: 'THIGH_LEFT' },
        ],
      })
      expect(result.success).toBe(true)
    })

    it('should accept month response with multiple entries', () => {
      const result = calendarMonthResponseSchema.safeParse({
        habits: [
          { date: '2026-01-21', water: true, nutrition: true, exercise: false },
          { date: '2026-01-22', water: false, nutrition: true, exercise: true },
          { date: '2026-01-23', water: true, nutrition: false, exercise: true },
        ],
        weighIns: [
          { date: '2026-01-15', weight: 86.0 },
          { date: '2026-01-22', weight: 85.5 },
        ],
        injections: [
          { date: '2026-01-08', site: 'THIGH_LEFT' },
          { date: '2026-01-15', site: 'THIGH_RIGHT' },
        ],
      })
      expect(result.success).toBe(true)
    })

    it('should reject missing habits array', () => {
      const result = calendarMonthResponseSchema.safeParse({
        weighIns: [],
        injections: [],
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing weighIns array', () => {
      const result = calendarMonthResponseSchema.safeParse({
        habits: [],
        injections: [],
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing injections array', () => {
      const result = calendarMonthResponseSchema.safeParse({
        habits: [],
        weighIns: [],
      })
      expect(result.success).toBe(false)
    })

    it('should reject habit with missing water field', () => {
      const result = calendarMonthResponseSchema.safeParse({
        habits: [{ date: '2026-01-23', nutrition: false, exercise: true }],
        weighIns: [],
        injections: [],
      })
      expect(result.success).toBe(false)
    })

    it('should reject weighIn with missing weight field', () => {
      const result = calendarMonthResponseSchema.safeParse({
        habits: [],
        weighIns: [{ date: '2026-01-23' }],
        injections: [],
      })
      expect(result.success).toBe(false)
    })
  })

  describe('calendarDayResponseSchema', () => {
    it('should accept day response with all null values', () => {
      const result = calendarDayResponseSchema.safeParse({
        date: '2026-01-23',
        habit: null,
        weighIn: null,
        injection: null,
      })
      expect(result.success).toBe(true)
    })

    it('should accept day response with habit data', () => {
      const result = calendarDayResponseSchema.safeParse({
        date: '2026-01-23',
        habit: { water: true, nutrition: false, exercise: true },
        weighIn: null,
        injection: null,
      })
      expect(result.success).toBe(true)
    })

    it('should accept day response with weighIn data', () => {
      const result = calendarDayResponseSchema.safeParse({
        date: '2026-01-23',
        habit: null,
        weighIn: { weight: 85.5, change: -0.5 },
        injection: null,
      })
      expect(result.success).toBe(true)
    })

    it('should accept day response with weighIn and null change', () => {
      const result = calendarDayResponseSchema.safeParse({
        date: '2026-01-23',
        habit: null,
        weighIn: { weight: 85.5, change: null },
        injection: null,
      })
      expect(result.success).toBe(true)
    })

    it('should accept day response with injection data', () => {
      const result = calendarDayResponseSchema.safeParse({
        date: '2026-01-23',
        habit: null,
        weighIn: null,
        injection: { site: 'THIGH_LEFT' },
      })
      expect(result.success).toBe(true)
    })

    it('should accept day response with all data', () => {
      const result = calendarDayResponseSchema.safeParse({
        date: '2026-01-23',
        habit: { water: true, nutrition: true, exercise: false },
        weighIn: { weight: 85.5, change: -0.5 },
        injection: { site: 'ABDOMEN_LEFT' },
      })
      expect(result.success).toBe(true)
    })

    it('should reject missing date', () => {
      const result = calendarDayResponseSchema.safeParse({
        habit: null,
        weighIn: null,
        injection: null,
      })
      expect(result.success).toBe(false)
    })

    it('should reject habit with missing fields', () => {
      const result = calendarDayResponseSchema.safeParse({
        date: '2026-01-23',
        habit: { water: true }, // missing nutrition and exercise
        weighIn: null,
        injection: null,
      })
      expect(result.success).toBe(false)
    })

    it('should reject weighIn with missing weight', () => {
      const result = calendarDayResponseSchema.safeParse({
        date: '2026-01-23',
        habit: null,
        weighIn: { change: -0.5 }, // missing weight
        injection: null,
      })
      expect(result.success).toBe(false)
    })
  })
})
