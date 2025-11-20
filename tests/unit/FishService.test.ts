import { describe, it, expect } from 'vitest'
import { FishService } from '../../src/services/FishService'
import { FishSpecies } from '../../src/models/types'

describe('FishService', () => {
  it('should create a fish with correct species config', () => {
    const fish = FishService.createFish(FishSpecies.GUPPY)
    expect(fish.species).toBe(FishSpecies.GUPPY)
    expect(fish.health).toBe(80)
    expect(fish.age).toBe(0)
  })

  it('should tick fish age and hunger', () => {
    const fish = FishService.createFish(FishSpecies.GUPPY)
    const ticked = FishService.tickFish(fish)
    expect(ticked.age).toBe(1)
    expect(ticked.hunger).toBeGreaterThan(0)
  })

  it('should calculate fish value correctly', () => {
    const fish = FishService.createFish(FishSpecies.GUPPY)
    const value = FishService.calculateFishValue(fish)
    expect(value).toBeGreaterThan(0)
  })
})
