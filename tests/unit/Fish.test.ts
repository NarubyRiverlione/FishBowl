import { describe, it, expect } from 'vitest'
import { Fish } from '../../src/models/Fish'

describe('Fish Model', () => {
  it('should initialize with default values', () => {
    const fish = new Fish('1', 100, 100)
    expect(fish.id).toBe('1')
    expect(fish.x).toBe(100)
    expect(fish.y).toBe(100)
    expect(fish.vx).toBe(0)
    expect(fish.vy).toBe(0)
  })

  it('should update position based on velocity', () => {
    const fish = new Fish('1', 0, 0)
    fish.friction = 0 // Disable friction for this test
    fish.vx = 10
    fish.vy = 5
    fish.update(1) // 1 second delta (or frame)
    // Assuming update uses delta time. If delta is frames, it might be different.
    // Let's assume delta is 1 for simplicity in this test, or check implementation.
    // If update logic is: x += vx * delta
    expect(fish.x).toBe(10)
    expect(fish.y).toBe(5)
  })

  it('should apply force to acceleration', () => {
    const fish = new Fish('1', 0, 0)
    fish.friction = 0 // Disable friction for this test
    fish.mass = 2
    fish.applyForce(10, 0) // Fx = 10
    // a = F/m = 10/2 = 5
    // update should apply acceleration to velocity
    fish.update(1)
    expect(fish.vx).toBe(5)
  })
})
