import { describe, it, expect } from 'vitest'
import { getSpeciesColor, randomSize, randomVelocity, randomPosition } from '../../src/lib/random'
import { FishSpecies } from '../../src/models/types'

describe('Random Utilities', () => {
  it('getSpeciesColor should return a valid hex string with species-specific base', () => {
    const guppyColor = getSpeciesColor(FishSpecies.GUPPY)
    expect(guppyColor).toMatch(/^#[0-9A-F]{6}$/i)

    // Test multiple species return different color families
    const goldfishColor = getSpeciesColor(FishSpecies.GOLDFISH)
    const tetraColor = getSpeciesColor(FishSpecies.TETRA)
    const bettaColor = getSpeciesColor(FishSpecies.BETTA)

    expect(goldfishColor).toMatch(/^#[0-9A-F]{6}$/i)
    expect(tetraColor).toMatch(/^#[0-9A-F]{6}$/i)
    expect(bettaColor).toMatch(/^#[0-9A-F]{6}$/i)

    // Check if multiple calls for same species produce variations
    const colors = new Set()
    for (let i = 0; i < 10; i++) {
      colors.add(getSpeciesColor(FishSpecies.GUPPY))
    }
    // Should have some variation (but not necessarily all different)
    expect(colors.size).toBeGreaterThan(1)
  })

  it('randomSize should return a scale between min and max', () => {
    const scale = randomSize(0.5, 1.5)
    expect(scale).toBeGreaterThanOrEqual(0.5)
    expect(scale).toBeLessThanOrEqual(1.5)

    // Check variance
    const sizes = new Set()
    for (let i = 0; i < 20; i++) {
      sizes.add(randomSize(0.5, 1.5))
    }
    expect(sizes.size).toBeGreaterThan(1)
  })

  it('randomVelocity should return a velocity within range', () => {
    const velocity = randomVelocity(5)
    expect(velocity).toBeGreaterThanOrEqual(-5)
    expect(velocity).toBeLessThanOrEqual(5)
  })

  it('randomPosition should return a position within bounds', () => {
    const pos = randomPosition(100, 500)
    expect(pos).toBeGreaterThanOrEqual(100)
    expect(pos).toBeLessThanOrEqual(500)
  })
})
