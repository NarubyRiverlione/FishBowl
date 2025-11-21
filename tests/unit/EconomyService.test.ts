import { describe, it, expect } from 'vitest'
import { EconomyService } from '../../src/services/EconomyService'
import { FishSpecies, FISH_SPECIES_CONFIG, ITank, IFish } from '../../src/models/types'

describe('EconomyService', () => {
  it('returns correct fish cost from species config', () => {
    const cost = EconomyService.getFishCost(FishSpecies.GUPPY)
    expect(cost).toBe(FISH_SPECIES_CONFIG[FishSpecies.GUPPY].baseValue)
  })

  it('canBuyFish respects credits and tank capacity', () => {
    const tank = {
      fish: [],
      capacity: 1,
      size: 'BOWL',
      hasFilter: false,
    } as unknown as ITank

    // Enough credits and empty tank -> can buy
    const can = EconomyService.canBuyFish(100, tank, FishSpecies.GUPPY)
    expect(can).toBe(true)

    // Not enough credits -> cannot buy
    const cannotAfford = EconomyService.canBuyFish(0, tank, FishSpecies.GUPPY)
    expect(cannotAfford).toBe(false)

    // Tank full -> cannot buy even with credits
    tank.fish = [{ id: 'f1', isAlive: true } as IFish]
    const isFull = EconomyService.canBuyFish(1000, tank, FishSpecies.GUPPY)
    expect(isFull).toBe(false)
  })

  it('calculates feed cost and canFeed', () => {
    const cost0 = EconomyService.getFeedCost(0)
    const cost3 = EconomyService.getFeedCost(3)
    expect(cost3).toBeGreaterThanOrEqual(cost0)

    expect(EconomyService.canFeed(100, 3)).toBe(true)
    expect(EconomyService.canFeed(0, 3)).toBe(false)
    // cannot feed zero fish
    expect(EconomyService.canFeed(100, 0)).toBe(false)
  })

  it('canClean and canBuyFilter and canUpgradeTank behaviors', () => {
    const tankStandard = { size: 'STANDARD', hasFilter: false } as unknown as ITank
    const tankBowl = { size: 'BOWL', hasFilter: false } as unknown as ITank

    expect(EconomyService.canClean(100)).toBe(true)
    expect(EconomyService.canClean(0)).toBe(false)

    // buy filter requires STANDARD tank
    expect(EconomyService.canBuyFilter(1000, tankStandard)).toBe(true)
    expect(EconomyService.canBuyFilter(0, tankStandard)).toBe(false)
    expect(EconomyService.canBuyFilter(1000, tankBowl)).toBe(false)

    // upgrade tank requires BOWL tank and enough credits
    expect(EconomyService.canUpgradeTank(1000, tankBowl)).toBe(true)
    expect(EconomyService.canUpgradeTank(0, tankBowl)).toBe(false)
    expect(EconomyService.canUpgradeTank(1000, tankStandard)).toBe(false)
  })
})

describe('EconomyService 2', () => {
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
