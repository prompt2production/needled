import { describe, it, expect } from 'vitest'
import {
  SITE_ROTATION_ORDER,
  getNextSite,
  getSiteLabel,
} from '@/lib/injection-site'
import type { InjectionSite } from '@/lib/validations/injection'

describe('injection site utilities', () => {
  describe('SITE_ROTATION_ORDER', () => {
    it('should have 6 sites in the correct order', () => {
      expect(SITE_ROTATION_ORDER).toHaveLength(6)
      expect(SITE_ROTATION_ORDER[0]).toBe('ABDOMEN_LEFT')
      expect(SITE_ROTATION_ORDER[1]).toBe('ABDOMEN_RIGHT')
      expect(SITE_ROTATION_ORDER[2]).toBe('THIGH_LEFT')
      expect(SITE_ROTATION_ORDER[3]).toBe('THIGH_RIGHT')
      expect(SITE_ROTATION_ORDER[4]).toBe('UPPER_ARM_LEFT')
      expect(SITE_ROTATION_ORDER[5]).toBe('UPPER_ARM_RIGHT')
    })
  })

  describe('getNextSite', () => {
    it('should return ABDOMEN_LEFT when lastSite is null', () => {
      expect(getNextSite(null)).toBe('ABDOMEN_LEFT')
    })

    it('should return ABDOMEN_RIGHT after ABDOMEN_LEFT', () => {
      expect(getNextSite('ABDOMEN_LEFT')).toBe('ABDOMEN_RIGHT')
    })

    it('should return THIGH_LEFT after ABDOMEN_RIGHT', () => {
      expect(getNextSite('ABDOMEN_RIGHT')).toBe('THIGH_LEFT')
    })

    it('should return THIGH_RIGHT after THIGH_LEFT', () => {
      expect(getNextSite('THIGH_LEFT')).toBe('THIGH_RIGHT')
    })

    it('should return UPPER_ARM_LEFT after THIGH_RIGHT', () => {
      expect(getNextSite('THIGH_RIGHT')).toBe('UPPER_ARM_LEFT')
    })

    it('should return UPPER_ARM_RIGHT after UPPER_ARM_LEFT', () => {
      expect(getNextSite('UPPER_ARM_LEFT')).toBe('UPPER_ARM_RIGHT')
    })

    it('should wrap around to ABDOMEN_LEFT after UPPER_ARM_RIGHT', () => {
      expect(getNextSite('UPPER_ARM_RIGHT')).toBe('ABDOMEN_LEFT')
    })

    it('should follow complete rotation cycle', () => {
      let site: InjectionSite | null = null

      site = getNextSite(site)
      expect(site).toBe('ABDOMEN_LEFT')

      site = getNextSite(site)
      expect(site).toBe('ABDOMEN_RIGHT')

      site = getNextSite(site)
      expect(site).toBe('THIGH_LEFT')

      site = getNextSite(site)
      expect(site).toBe('THIGH_RIGHT')

      site = getNextSite(site)
      expect(site).toBe('UPPER_ARM_LEFT')

      site = getNextSite(site)
      expect(site).toBe('UPPER_ARM_RIGHT')

      // Should wrap around
      site = getNextSite(site)
      expect(site).toBe('ABDOMEN_LEFT')
    })
  })

  describe('getSiteLabel', () => {
    it('should return "Left Abdomen" for ABDOMEN_LEFT', () => {
      expect(getSiteLabel('ABDOMEN_LEFT')).toBe('Left Abdomen')
    })

    it('should return "Right Abdomen" for ABDOMEN_RIGHT', () => {
      expect(getSiteLabel('ABDOMEN_RIGHT')).toBe('Right Abdomen')
    })

    it('should return "Left Thigh" for THIGH_LEFT', () => {
      expect(getSiteLabel('THIGH_LEFT')).toBe('Left Thigh')
    })

    it('should return "Right Thigh" for THIGH_RIGHT', () => {
      expect(getSiteLabel('THIGH_RIGHT')).toBe('Right Thigh')
    })

    it('should return "Left Upper Arm" for UPPER_ARM_LEFT', () => {
      expect(getSiteLabel('UPPER_ARM_LEFT')).toBe('Left Upper Arm')
    })

    it('should return "Right Upper Arm" for UPPER_ARM_RIGHT', () => {
      expect(getSiteLabel('UPPER_ARM_RIGHT')).toBe('Right Upper Arm')
    })
  })
})
