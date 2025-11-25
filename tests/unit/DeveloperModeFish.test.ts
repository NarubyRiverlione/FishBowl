import { describe, it, expect } from 'vitest'
import { createDeveloperModeFish } from '../../src/lib/fishHelpers'
import { FishSpecies } from '../../src/models/types'

describe('Developer Mode Fish Creation', () => {
  it('should create fish of all species and age groups', () => {
    const devFish = createDeveloperModeFish()

    // Should have 12 fish total (4 species x 3 age groups)
    expect(devFish).toHaveLength(12)

    // Check that we have all species
    const speciesFound = new Set(devFish.map((f) => f.species))
    expect(speciesFound.size).toBe(4)
    expect(speciesFound.has(FishSpecies.GUPPY)).toBe(true)
    expect(speciesFound.has(FishSpecies.GOLDFISH)).toBe(true)
    expect(speciesFound.has(FishSpecies.TETRA)).toBe(true)
    expect(speciesFound.has(FishSpecies.BETTA)).toBe(true)

    // Check that we have all age groups
    const agesFound = new Set(devFish.map((f) => f.age))
    expect(agesFound.size).toBe(3)
    expect(agesFound.has(50)).toBe(true) // young
    expect(agesFound.has(200)).toBe(true) // mature
    expect(agesFound.has(400)).toBe(true) // old

    // Check that each species has exactly 3 fish (one of each age)
    for (const species of Object.values(FishSpecies)) {
      const fishOfSpecies = devFish.filter((f) => f.species === species)
      expect(fishOfSpecies).toHaveLength(3)

      const agesBySpecies = fishOfSpecies.map((f) => f.age).sort((a, b) => a - b)
      expect(agesBySpecies).toEqual([50, 200, 400])
    }

    // Check that fish have descriptive names
    const guppyFish = devFish.filter((f) => f.species === FishSpecies.GUPPY)
    expect(guppyFish.some((f) => f.name?.includes('guppy-young'))).toBe(true)
    expect(guppyFish.some((f) => f.name?.includes('guppy-mature'))).toBe(true)
    expect(guppyFish.some((f) => f.name?.includes('guppy-old'))).toBe(true)
  })

  it('should create fish with proper initial state', () => {
    const devFish = createDeveloperModeFish()

    // All fish should be alive and healthy initially
    for (const fish of devFish) {
      expect(fish.isAlive).toBe(true)
      expect(fish.health).toBeGreaterThan(0)
      expect(fish.hunger).toBeLessThanOrEqual(100)
      expect(fish.id).toBeDefined()
      expect(fish.color).toBeDefined()
      expect(fish.createdAt).toBeDefined()
    }
  })
})
