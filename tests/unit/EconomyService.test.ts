import { describe, it, expect } from 'vitest'
import { EconomyService } from '../../src/services/EconomyService'
import { FishSpecies, ITankData } from '../../src/models/types'
import { FISH_SPECIES_CONFIG } from '../../src/lib/constants'
import { BUSINESS_LOGIC } from '../config/testConstants'

describe('EconomyService', () => {
  it('returns correct fish cost from species config', () => {
    const cost = EconomyService.getFishCost(FishSpecies.GUPPY)
    const { baseValue } = FISH_SPECIES_CONFIG[FishSpecies.GUPPY]
    expect(cost).toBe(baseValue)
  })

  it('canBuyFish respects credits and tank capacity', () => {
    const tank = {
      fish: [],
      capacity: 1,
      size: 'BOWL',
      hasFilter: false,
    } as unknown as ITankData

    // Enough credits and empty tank -> can buy
    const sufficientCredits = BUSINESS_LOGIC.COSTS.GUPPY * 2 // More than enough
    const can = EconomyService.canBuyFish(sufficientCredits, tank, FishSpecies.GUPPY)
    expect(can).toBe(true)

    // Not enough credits -> cannot buy
    const insufficientCredits = BUSINESS_LOGIC.COSTS.GUPPY - 1
    const cannotAfford = EconomyService.canBuyFish(insufficientCredits, tank, FishSpecies.GUPPY)
    expect(cannotAfford).toBe(false)

    // Tank full -> cannot buy even with credits
    tank.fish = [{ id: 'f1', isAlive: true } as IFish]
    const abundantCredits = BUSINESS_LOGIC.COSTS.GUPPY * 10
    const isFull = EconomyService.canBuyFish(abundantCredits, tank, FishSpecies.GUPPY)
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
    const tankStandard = { size: 'STANDARD', hasFilter: false } as unknown as ITankData
    const tankBowl = { size: 'BOWL', hasFilter: false } as unknown as ITankData

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
