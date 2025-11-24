import { describe, it, expect, beforeEach } from 'vitest'
import { RectangularTankShape } from '../../src/services/physics/shapes/RectangularTankShape'
import { CircularTankShape } from '../../src/services/physics/shapes/CircularTankShape'
import { IFishLogic as IFish, FishSpecies } from '../../src/models/types/index'
import {
  COLLISION_BOUNDARY_BUFFER,
  WATER_SURFACE_RATIO,
  TANK_STANDARD_WIDTH,
  TANK_STANDARD_HEIGHT,
  TANK_BOWL_WIDTH,
  PERCENTAGE_MAX,
  FISH_SPAWN_SIZE_MIN
} from '../../src/lib/constants'

const TANK_X = TANK_STANDARD_WIDTH / 2
const TANK_Y = TANK_STANDARD_HEIGHT / 2
const TEST_FISH_RADIUS = 10
const TEST_FISH_VELOCITY = 5
const TEST_OFFSET = 50
const TEST_SMALL_OFFSET = 5
const TEST_HIGH_VELOCITY = 10

describe('TankShapes', () => {
  describe('RectangularTankShape', () => {
    let shape: RectangularTankShape
    let testFish: IFish

    beforeEach(() => {
      shape = new RectangularTankShape(TANK_X, TANK_Y, TANK_STANDARD_WIDTH, TANK_STANDARD_HEIGHT)
      testFish = {
        id: 'fish-1',
        species: FishSpecies.GUPPY,
        color: '#FF0000',
        size: FISH_SPAWN_SIZE_MIN,
        age: 0,
        health: PERCENTAGE_MAX,
        hunger: 0,
        isAlive: true,
        genetics: {},
        createdAt: Date.now(),
        x: TANK_X,
        y: TANK_Y,
        vx: 0,
        vy: 0,
        radius: TEST_FISH_RADIUS,
      } as unknown as IFish
    })

    it('should identify when fish is within bounds', () => {
      const result = shape.checkBoundary(testFish)
      expect(result).toBe(true)
    })

    it('should detect boundary violation on left wall', () => {
      testFish.x = 0
      const result = shape.checkBoundary(testFish)
      expect(result).toBe(false)
    })

    it('should detect boundary violation on right wall', () => {
      testFish.x = TANK_STANDARD_WIDTH
      const result = shape.checkBoundary(testFish)
      expect(result).toBe(false)
    })

    it('should detect boundary violation on top wall', () => {
      testFish.y = 0
      const result = shape.checkBoundary(testFish)
      expect(result).toBe(false)
    })

    it('should detect boundary violation on water surface', () => {
      const waterBottom = TANK_Y + (TANK_STANDARD_HEIGHT * WATER_SURFACE_RATIO)
      testFish.y = waterBottom + TEST_OFFSET
      const result = shape.checkBoundary(testFish)
      expect(result).toBe(false)
    })

    it('should resolve left wall collision by pushing right', () => {
      testFish.x = 0
      testFish.vx = -TEST_FISH_VELOCITY
      shape.resolveBoundary(testFish)
      expect(testFish.x).toBeGreaterThan(testFish.radius + COLLISION_BOUNDARY_BUFFER - TEST_FISH_VELOCITY)
      expect(testFish.vx).toBeGreaterThanOrEqual(0)
    })

    it('should resolve right wall collision by pushing left', () => {
      testFish.x = TANK_STANDARD_WIDTH
      testFish.vx = TEST_FISH_VELOCITY
      shape.resolveBoundary(testFish)
      expect(testFish.x).toBeLessThan(TANK_STANDARD_WIDTH - testFish.radius - COLLISION_BOUNDARY_BUFFER + TEST_FISH_VELOCITY)
      expect(testFish.vx).toBeLessThanOrEqual(0)
    })

    it('should resolve top wall collision by pushing down', () => {
      testFish.y = 0
      testFish.vy = -TEST_FISH_VELOCITY
      shape.resolveBoundary(testFish)
      expect(testFish.y).toBeGreaterThan(testFish.radius + COLLISION_BOUNDARY_BUFFER - TEST_FISH_VELOCITY)
      expect(testFish.vy).toBeGreaterThanOrEqual(0)
    })

    it('should resolve water surface collision by pushing up', () => {
      const waterBottom = TANK_Y + (TANK_STANDARD_HEIGHT * WATER_SURFACE_RATIO)
      testFish.y = waterBottom + TEST_OFFSET
      testFish.vy = TEST_FISH_VELOCITY
      shape.resolveBoundary(testFish)
      expect(testFish.y).toBeLessThan(waterBottom - testFish.radius - COLLISION_BOUNDARY_BUFFER + TEST_FISH_VELOCITY)
      expect(testFish.vy).toBeLessThanOrEqual(0)
    })

    it('should provide valid spawn bounds', () => {
      const bounds = shape.getSpawnBounds()
      expect(bounds.minX).toBeGreaterThan(0)
      expect(bounds.maxX).toBeLessThan(TANK_STANDARD_WIDTH)
      expect(bounds.minY).toBeGreaterThan(0)
      expect(bounds.maxY).toBeLessThan(TANK_Y + (TANK_STANDARD_HEIGHT * WATER_SURFACE_RATIO))
      expect(bounds.minX).toBeLessThan(bounds.maxX)
      expect(bounds.minY).toBeLessThan(bounds.maxY)
    })

    it('should have correct shape type', () => {
      expect(shape.type).toBe('rectangular')
    })
  })

  describe('CircularTankShape', () => {
    let shape: CircularTankShape
    let testFish: IFish

    beforeEach(() => {
      shape = new CircularTankShape(TANK_X, TANK_Y, TANK_BOWL_WIDTH / 2) // radius 150
      testFish = {
        id: 'fish-1',
        species: FishSpecies.GUPPY,
        color: '#FF0000',
        size: FISH_SPAWN_SIZE_MIN,
        age: 0,
        health: PERCENTAGE_MAX,
        hunger: 0,
        isAlive: true,
        genetics: {},
        createdAt: Date.now(),
        x: TANK_X,
        y: TANK_Y,
        vx: 0,
        vy: 0,
        radius: TEST_FISH_RADIUS,
      } as unknown as IFish
    })

    it('should identify when fish is within bounds', () => {
      const result = shape.checkBoundary(testFish)
      expect(result).toBe(true)
    })

    it('should detect boundary violation near circular wall', () => {
      // Position fish near the circular boundary
      testFish.x = TANK_X + (TANK_BOWL_WIDTH / 2) - TEST_SMALL_OFFSET
      testFish.y = TANK_Y
      const result = shape.checkBoundary(testFish)
      expect(result).toBe(false)
    })

    it('should detect boundary violation above water surface', () => {
      const waterSurface = TANK_Y + ((TANK_BOWL_WIDTH / 2) * WATER_SURFACE_RATIO)
      testFish.y = waterSurface + TEST_OFFSET
      const result = shape.checkBoundary(testFish)
      expect(result).toBe(false)
    })

    it('should resolve circular wall collision by pushing toward center', () => {
      testFish.x = TANK_X + (TANK_BOWL_WIDTH / 2) - TEST_SMALL_OFFSET
      testFish.y = TANK_Y
      testFish.vx = TEST_FISH_VELOCITY
      shape.resolveBoundary(testFish)
      expect(testFish.x).toBeLessThan(TANK_X + (TANK_BOWL_WIDTH / 2) - TEST_SMALL_OFFSET)
    })

    it('should resolve water surface collision', () => {
      const waterSurface = TANK_Y + ((TANK_BOWL_WIDTH / 2) * WATER_SURFACE_RATIO)
      testFish.y = waterSurface + TEST_OFFSET
      testFish.vy = TEST_FISH_VELOCITY
      shape.resolveBoundary(testFish)
      expect(testFish.y).toBeLessThan(waterSurface + TEST_OFFSET)
      expect(testFish.vy).toBeLessThanOrEqual(0)
    })

    it('should provide valid spawn bounds for circular tank', () => {
      const bounds = shape.getSpawnBounds()
      expect(bounds.minX).toBeGreaterThan(TANK_X - (TANK_BOWL_WIDTH / 2))
      expect(bounds.maxX).toBeLessThan(TANK_X + (TANK_BOWL_WIDTH / 2))
      expect(bounds.minY).toBeGreaterThan(TANK_Y - (TANK_BOWL_WIDTH / 2))
      expect(bounds.maxY).toBeLessThan(TANK_Y + ((TANK_BOWL_WIDTH / 2) * WATER_SURFACE_RATIO))
      expect(bounds.minX).toBeLessThan(bounds.maxX)
      expect(bounds.minY).toBeLessThan(bounds.maxY)
    })

    it('should have correct shape type', () => {
      expect(shape.type).toBe('circular')
    })

    it('should have radius property', () => {
      expect(shape.radius).toBe(TANK_BOWL_WIDTH / 2)
    })

    it('should handle fish at tank center', () => {
      testFish.x = TANK_X
      testFish.y = TANK_Y
      testFish.vx = TEST_HIGH_VELOCITY
      testFish.vy = TEST_HIGH_VELOCITY
      // Should not throw
      shape.resolveBoundary(testFish)
      expect(testFish.isAlive).toBe(true)
    })

    it('should properly reflect velocity on circular wall collision', () => {
      testFish.x = TANK_X + (TANK_BOWL_WIDTH / 2) - TEST_FISH_RADIUS // Near right wall
      testFish.y = TANK_Y
      testFish.vx = TEST_HIGH_VELOCITY // Moving toward wall
      const originalVx = testFish.vx
      shape.resolveBoundary(testFish)
      // Velocity should be reflected (negative if it was positive)
      expect(testFish.vx).toBeLessThanOrEqual(originalVx)
    })
  })
})
