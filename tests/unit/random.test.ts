import { describe, it, expect } from 'vitest'
import { randomColor, randomSize, randomVelocity, randomPosition } from '../../src/lib/random'

describe('Random Utilities', () => {
  it('randomColor should return a valid hex string', () => {
    const color = randomColor()
    expect(color).toMatch(/^#[0-9A-F]{6}$/i)
  })

  it('randomSize should return a scale between min and max', () => {
    const scale = randomSize(0.5, 1.5)
    expect(scale).toBeGreaterThanOrEqual(0.5)
    expect(scale).toBeLessThanOrEqual(1.5)
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
