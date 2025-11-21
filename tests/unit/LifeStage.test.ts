import { describe, it, expect } from 'vitest'
import {
  getLifeStage,
  getLifeStageSizeMultiplier,
  getLifeStageColorSaturation,
  type LifeStage,
} from '../../src/lib/fishHelpers'

describe('Fish Life Stage Utilities', () => {
  describe('getLifeStage', () => {
    it('should return "young" for fish aged 0-119', () => {
      expect(getLifeStage(0)).toBe('young')
      expect(getLifeStage(50)).toBe('young')
      expect(getLifeStage(119)).toBe('young')
    })

    it('should return "mature" for fish aged 120-299', () => {
      expect(getLifeStage(120)).toBe('mature')
      expect(getLifeStage(200)).toBe('mature')
      expect(getLifeStage(299)).toBe('mature')
    })

    it('should return "old" for fish aged 300+', () => {
      expect(getLifeStage(300)).toBe('old')
      expect(getLifeStage(500)).toBe('old')
      expect(getLifeStage(1000)).toBe('old')
    })

    it('should handle edge cases correctly', () => {
      // Boundary testing
      expect(getLifeStage(119.9)).toBe('young') // Just before mature
      expect(getLifeStage(120.1)).toBe('mature') // Just after young
      expect(getLifeStage(299.9)).toBe('mature') // Just before old
      expect(getLifeStage(300.1)).toBe('old') // Just after mature
    })
  })

  describe('getLifeStageSizeMultiplier', () => {
    it('should return 1.0 for young fish', () => {
      expect(getLifeStageSizeMultiplier('young')).toBe(1.0)
    })

    it('should return 1.3 for mature fish', () => {
      expect(getLifeStageSizeMultiplier('mature')).toBe(1.3)
    })

    it('should return 1.3 for old fish', () => {
      expect(getLifeStageSizeMultiplier('old')).toBe(1.3)
    })

    it('should handle invalid life stages gracefully', () => {
      expect(getLifeStageSizeMultiplier('invalid' as LifeStage)).toBe(1.0)
    })
  })

  describe('getLifeStageColorSaturation', () => {
    it('should return 1.0 for young fish (full saturation)', () => {
      expect(getLifeStageColorSaturation('young')).toBe(1.0)
    })

    it('should return 1.0 for mature fish (full saturation)', () => {
      expect(getLifeStageColorSaturation('mature')).toBe(1.0)
    })

    it('should return 0.8 for old fish (reduced saturation)', () => {
      expect(getLifeStageColorSaturation('old')).toBe(0.8)
    })

    it('should handle invalid life stages gracefully', () => {
      expect(getLifeStageColorSaturation('invalid' as LifeStage)).toBe(1.0)
    })
  })

  describe('Integration: Age to Visual Parameters', () => {
    it('should correctly map ages to expected visual parameters', () => {
      // Young fish (age 50)
      const youngAge = 50
      const youngStage = getLifeStage(youngAge)
      expect(youngStage).toBe('young')
      expect(getLifeStageSizeMultiplier(youngStage)).toBe(1.0)
      expect(getLifeStageColorSaturation(youngStage)).toBe(1.0)

      // Mature fish (age 200)
      const matureAge = 200
      const matureStage = getLifeStage(matureAge)
      expect(matureStage).toBe('mature')
      expect(getLifeStageSizeMultiplier(matureStage)).toBe(1.3)
      expect(getLifeStageColorSaturation(matureStage)).toBe(1.0)

      // Old fish (age 400)
      const oldAge = 400
      const oldStage = getLifeStage(oldAge)
      expect(oldStage).toBe('old')
      expect(getLifeStageSizeMultiplier(oldStage)).toBe(1.3)
      expect(getLifeStageColorSaturation(oldStage)).toBe(0.8)
    })

    it('should demonstrate size progression through life stages', () => {
      const baseSize = 1.0

      // Young: base size
      const youngMultiplier = getLifeStageSizeMultiplier(getLifeStage(50))
      expect(baseSize * youngMultiplier).toBe(1.0)

      // Mature: 30% larger
      const matureMultiplier = getLifeStageSizeMultiplier(getLifeStage(200))
      expect(baseSize * matureMultiplier).toBe(1.3)

      // Old: still 30% larger (no further size increase)
      const oldMultiplier = getLifeStageSizeMultiplier(getLifeStage(400))
      expect(baseSize * oldMultiplier).toBe(1.3)
    })

    it('should demonstrate color saturation changes through life stages', () => {
      // Young and mature fish maintain full saturation
      expect(getLifeStageColorSaturation(getLifeStage(50))).toBe(1.0) // young
      expect(getLifeStageColorSaturation(getLifeStage(200))).toBe(1.0) // mature

      // Old fish have reduced saturation (faded appearance)
      expect(getLifeStageColorSaturation(getLifeStage(400))).toBe(0.8) // old
    })
  })

  describe('Visual Requirements Validation', () => {
    it('should meet specific FR-015 requirements', () => {
      // FR-015: Size multiplier requirements
      // - Young (0-119): 1.0x
      // - Mature (120-299): 1.3x
      // - Old (300+): 1.3x
      expect(getLifeStageSizeMultiplier(getLifeStage(0))).toBe(1.0)
      expect(getLifeStageSizeMultiplier(getLifeStage(119))).toBe(1.0)
      expect(getLifeStageSizeMultiplier(getLifeStage(120))).toBe(1.3)
      expect(getLifeStageSizeMultiplier(getLifeStage(299))).toBe(1.3)
      expect(getLifeStageSizeMultiplier(getLifeStage(300))).toBe(1.3)

      // FR-015: Color saturation requirements
      // - Young/Mature: Full color (1.0x)
      // - Old: Desaturated (0.8x)
      expect(getLifeStageColorSaturation(getLifeStage(119))).toBe(1.0)
      expect(getLifeStageColorSaturation(getLifeStage(299))).toBe(1.0)
      expect(getLifeStageColorSaturation(getLifeStage(300))).toBe(0.8)
    })
  })
})
