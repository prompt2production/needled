import { describe, it, expect } from 'vitest'
import { getNextDoseNumber } from '@/lib/dose-tracking'

describe('getNextDoseNumber', () => {
  it('should return 1 when lastDoseNumber is null (no previous injection)', () => {
    expect(getNextDoseNumber(null)).toBe(1)
  })

  it('should return 2 when lastDoseNumber is 1', () => {
    expect(getNextDoseNumber(1)).toBe(2)
  })

  it('should return 3 when lastDoseNumber is 2', () => {
    expect(getNextDoseNumber(2)).toBe(3)
  })

  it('should return 4 when lastDoseNumber is 3', () => {
    expect(getNextDoseNumber(3)).toBe(4)
  })

  it('should return 1 when lastDoseNumber is 4 (new pen)', () => {
    expect(getNextDoseNumber(4)).toBe(1)
  })

  it('should handle undefined as null (return 1)', () => {
    expect(getNextDoseNumber(undefined as unknown as null)).toBe(1)
  })
})
