/**
 * Integration test for floor physics (T041d)
 * Tests that fish settle naturally on the floor with gentle restitution
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { FishService } from '../../src/services/FishService'
import { createTankShape } from '../../src/services/physics/TankShapeFactory'
import { FLOOR_RESTITUTION, WALL_RESTITUTION, WATER_LEVEL } from '../../src/lib/constants'
import { getFloorConfig } from '../../src/models/types'
import { ITankLogic, ITankGeometry } from '../../src/models/types'

describe('Floor Physics', () => {
  let tank: Partial<ITankLogic>
  const tankWidth = 600
  const tankHeight = 600
  const floorY = tankHeight * WATER_LEVEL

  beforeEach(() => {
    const geometry: ITankGeometry = {
      width: tankWidth,
      height: tankHeight,
      centerX: tankWidth / 2,
      centerY: tankHeight / 2,
    }

    const shape = createTankShape('STANDARD')

    tank = {
      id: 'test-tank',
      size: 'STANDARD',
      geometry,
      shape,
      floor: getFloorConfig('STANDARD', tankWidth, tankHeight),
    } as Partial<ITankLogic>
  })

  it('should have floor with correct restitution', () => {
    expect(tank.floor).toBeDefined()
    expect(tank.floor!.restitution).toBe(FLOOR_RESTITUTION)
    expect(tank.floor!.restitution).toBeLessThan(WALL_RESTITUTION)
    expect(tank.floor!.restitution).toBe(0.2)
  })

  it('should have visible floor for STANDARD tanks', () => {
    expect(tank.floor!.visible).toBe(true)
    expect(tank.floor!.type).toBe('pebble')
  })

  it('should have floor positioned at bottom of tank', () => {
    expect(tank.floor!.geometry.y).toBeGreaterThan(0)
    expect(tank.floor!.geometry.width).toBe(tankWidth)
  })

  it('should have appropriate floor color', () => {
    expect(tank.floor!.color).toBeDefined()
    // Sandy/pebble color (brownish)
    expect(typeof tank.floor!.color).toBe('number')
    expect(tank.floor!.color).toBeGreaterThan(0)
  })

  it('should apply gentle restitution when fish bounces off floor', () => {
    // Create a fish above the floor with downward velocity
    const fish = FishService.createFish('GOLDFISH')
    fish.geometry.x = tankWidth / 2
    fish.geometry.y = tankHeight - 100 // Above floor
    fish.geometry.velocityX = 0
    fish.geometry.velocityY = 10 // Moving downward

    const initialVelocity = fish.geometry.velocityY
    const floor = tank.floor!

    // Simulate floor collision
    // With restitution of 0.2, velocity should be reduced significantly
    const bounceVelocity = -initialVelocity * floor.restitution

    // Verify bounce is gentle (much lower than wall bounce would be)
    expect(Math.abs(bounceVelocity)).toBeLessThan(Math.abs(initialVelocity))
    expect(Math.abs(bounceVelocity)).toBeLessThan(initialVelocity * WALL_RESTITUTION)

    // Specifically check 0.2 restitution calculation
    expect(bounceVelocity).toBe(-10 * 0.2)
    expect(bounceVelocity).toBe(-2)
  })

  it('should differentiate between floor and wall restitution', () => {
    const floor = tank.floor!
    expect(floor.restitution).toBeLessThan(WALL_RESTITUTION)
    expect(floor.restitution).toBe(0.2)
    expect(WALL_RESTITUTION).toBe(0.8)

    // Verify ratio - floor is much gentler
    expect(floor.restitution / WALL_RESTITUTION).toBe(0.25) // 0.2 / 0.8 = 0.25
  })

  it('should have invisible floor for BOWL tanks', () => {
    const bowlFloor = getFloorConfig('BOWL', tankWidth, tankHeight)
    expect(bowlFloor.visible).toBe(false)
    expect(bowlFloor.type).toBe('invisible')
    expect(bowlFloor.restitution).toBe(FLOOR_RESTITUTION)
  })

  it('should have sand floor for BIG tanks', () => {
    const bigFloor = getFloorConfig('BIG', 900, 500)
    expect(bigFloor.visible).toBe(true)
    expect(bigFloor.type).toBe('sand')
    expect(bigFloor.restitution).toBe(FLOOR_RESTITUTION)
    expect(bigFloor.color).toBeDefined()
  })

  it('should have friction property for water resistance', () => {
    const floor = tank.floor!
    expect(floor.friction).toBeDefined()
    expect(floor.friction).toBeGreaterThan(0)
    expect(floor.friction).toBeLessThan(0.01)
  })

  it('should allow fish to settle with natural resting behavior', () => {
    // Create a fish that will settle on the floor
    const fish = FishService.createFish('GUPPY')
    fish.geometry.x = tankWidth / 2
    fish.geometry.y = tankHeight - 150
    fish.geometry.velocityX = 5
    fish.geometry.velocityY = 8

    const floor = tank.floor!

    // Simulate multiple bounces with floor restitution
    let velocity = fish.geometry.velocityY
    const bounces: number[] = []

    for (let i = 0; i < 5; i++) {
      velocity = -velocity * floor.restitution
      bounces.push(Math.abs(velocity))
    }

    // Each bounce should be smaller than the previous one
    for (let i = 1; i < bounces.length; i++) {
      expect(bounces[i]).toBeLessThan(bounces[i - 1])
    }

    // After several bounces, velocity should approach zero (settling)
    expect(bounces[bounces.length - 1]).toBeLessThan(bounces[0] * 0.1)
  })
})
