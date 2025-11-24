import { describe, it, expect } from 'vitest'
import { Tank } from '../../src/models/Tank'
import { Fish } from '../../src/models/Fish'
import { TANK_BIG_WIDTH, TANK_BIG_HEIGHT } from '../../src/lib/constants'

describe('Tank Model', () => {
  it('should initialize with dimensions', () => {
    const tank = new Tank(TANK_BIG_WIDTH, TANK_BIG_HEIGHT, 0x000000)
    expect(tank.geometry.width).toBe(TANK_BIG_WIDTH)
    expect(tank.geometry.height).toBe(TANK_BIG_HEIGHT)
    expect(tank.backgroundColor).toBe(0x000000)
    expect(tank.fish.length).toBe(0)
  })

  it('should add fish', () => {
    const tank = new Tank(TANK_BIG_WIDTH, TANK_BIG_HEIGHT, 0x000000)
    const centerX = TANK_BIG_WIDTH / 2
    const centerY = TANK_BIG_HEIGHT / 2
    const fish = new Fish('1', centerX, centerY)
    tank.addFish(fish)
    expect(tank.fish.length).toBe(1)
    expect(tank.fish[0]).toBe(fish)
  })

  it('should update all fish', () => {
    const tank = new Tank(TANK_BIG_WIDTH, TANK_BIG_HEIGHT, 0x000000)
    const centerX = TANK_BIG_WIDTH / 2
    const centerY = TANK_BIG_HEIGHT / 2
    const fish = new Fish('1', centerX, centerY)
    fish.vx = 10
    fish.friction = 0
    tank.addFish(fish)
    const initialX = fish.x
    tank.update(1)
    // Fish position should increase (moved by velocity + swim forces)
    expect(fish.x).toBeGreaterThan(initialX)
  })
})
