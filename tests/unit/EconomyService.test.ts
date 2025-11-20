import { describe, it, expect } from 'vitest'
import { EconomyService } from '../../src/services/EconomyService'
import { FishSpecies } from '../../src/models/types'

describe('EconomyService', () => {
  it('should return correct fish cost', () => {
    expect(EconomyService.getFishCost(FishSpecies.GUPPY)).toBe(50)
  })

  it('should calculate feed cost correctly', () => {
    expect(EconomyService.getFeedCost(1)).toBeGreaterThan(0)
  })

  it('should validate purchase capability', () => {
    // Mock tank
    const tank = { fish: [], capacity: 10 } as unknown as import('../../src/models/types').ITank
    expect(EconomyService.canBuyFish(100, tank, FishSpecies.GUPPY)).toBe(true)
    expect(EconomyService.canBuyFish(0, tank, FishSpecies.GUPPY)).toBe(false)
  })
})
