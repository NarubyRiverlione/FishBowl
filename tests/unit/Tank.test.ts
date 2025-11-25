import { describe, it, expect } from 'vitest'
import { Tank } from '../../src/models/Tank'
import { Fish } from '../../src/models/Fish'

describe('Tank Model', () => {
  it('should initialize with dimensions', () => {
    const tank = new Tank(800, 600, 0x000000)
    expect(tank.geometry.width).toBe(800)
    expect(tank.geometry.height).toBe(600)
    expect(tank.backgroundColor).toBe(0x000000)
    expect(tank.fish.length).toBe(0)
  })

  it('should add fish', () => {
    const tank = new Tank(800, 600, 0x000000)
    const fish = new Fish('1', 100, 100)
    tank.addFish(fish)
    expect(tank.fish.length).toBe(1)
    expect(tank.fish[0]).toBe(fish)
  })

  it('should update all fish', () => {
    const tank = new Tank(800, 600, 0x000000)
    const fish = new Fish('1', 100, 100)
    fish.vx = 10
    fish.friction = 0
    tank.addFish(fish)
    const initialX = fish.x
    tank.update(1)
    // Fish should move, but exact position depends on physics implementation
    expect(fish.x).toBeGreaterThan(initialX)
    expect(fish.x).toBeLessThan(initialX + 100) // Reasonable upper bound
  })
})
