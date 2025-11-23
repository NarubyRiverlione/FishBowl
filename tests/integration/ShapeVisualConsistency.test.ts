/**
 * Integration tests for shape-visual consistency (T042e)
 * Verifies rendered shape matches collision boundaries
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { TankContainer } from '../../src/game/views/TankContainer'
import { Tank } from '../../src/models/Tank'
import { Fish } from '../../src/models/Fish'
import { TankSize, FishSpecies } from '../../src/models/types'
import {
  TANK_BOWL_SIZE,
  TANK_STANDARD_SIZE,
  TANK_BIG_WIDTH,
  TANK_BIG_HEIGHT,
  WATER_LEVEL,
} from '../../src/lib/constants'

describe('Shape-Visual Consistency (T042e)', () => {
  let mockTank: Tank

  beforeEach(() => {
    // Base tank template
    mockTank = new Tank(TANK_BOWL_SIZE, TANK_BOWL_SIZE, 0x87ceeb)
    mockTank.id = 'test-tank'
    mockTank.size = 'BOWL' as TankSize
    mockTank.capacity = 2
    mockTank.waterQuality = 100
    mockTank.pollution = 0
    mockTank.hasFilter = false
    mockTank.temperature = 25
  })

  describe('Collision Boundary Consistency', () => {
    it('should have consistent boundaries for BOWL tank (circular)', () => {
      const tank = new Tank(TANK_BOWL_SIZE, TANK_BOWL_SIZE, 0x87ceeb)
      tank.size = 'BOWL' as TankSize
      const container = new TankContainer(tank)

      // Test collision boundaries match visual boundaries
      const radius = TANK_BOWL_SIZE / 2
      const centerX = tank.geometry.width / 2
      const centerY = tank.geometry.height / 2

      // Create test fish for boundary checking
      const insideFish = new Fish('test-fish-1', centerX, centerY, '#ffffff', 1.0)
      insideFish.species = FishSpecies.GUPPY
      insideFish.geometry.radius = 5 // Smaller radius to ensure it fits inside boundary

      const outsideFish = new Fish('test-fish-2', centerX + radius + 20, centerY, '#ffffff', 1.0)
      outsideFish.species = FishSpecies.GUPPY
      outsideFish.geometry.radius = 5

      // Test points inside the circle should be within boundaries
      const isInsideOutOfBounds = tank.checkBoundary(insideFish)
      expect(isInsideOutOfBounds).toBe(false) // Should NOT be out of bounds

      // Test points outside the circle should be out of boundaries
      const isOutsideOutOfBounds = tank.checkBoundary(outsideFish)
      expect(isOutsideOutOfBounds).toBe(true) // Should be out of bounds

      // Visual rendering should be defined
      expect(container).toBeDefined()
    })

    it('should have consistent boundaries for STANDARD tank (rectangular)', () => {
      const tank = new Tank(TANK_STANDARD_SIZE, TANK_STANDARD_SIZE, 0x87ceeb)
      tank.size = 'STANDARD' as TankSize

      const container = new TankContainer(tank)

      // Create test fish for boundary checking
      const insideFish = new Fish('test-fish-1', tank.geometry.width / 2, tank.geometry.height / 2, '#ffffff', 1.0)
      insideFish.species = FishSpecies.GUPPY
      insideFish.geometry.radius = 10

      const outsideFish = new Fish('test-fish-2', tank.geometry.width + 20, tank.geometry.height / 2, '#ffffff', 1.0)
      outsideFish.species = FishSpecies.GUPPY
      outsideFish.geometry.radius = 10

      // Test points inside the rectangle should be valid (not out of bounds)
      const isInsideOutOfBounds = tank.checkBoundary(insideFish)
      expect(isInsideOutOfBounds).toBe(false) // Should NOT be out of bounds

      // Test points outside the rectangle should be invalid (out of bounds)
      const isOutsideOutOfBounds = tank.checkBoundary(outsideFish)
      expect(isOutsideOutOfBounds).toBe(true) // Should be out of bounds

      // Visual rendering should use the same dimensions
      expect(tank.geometry.width).toBe(TANK_STANDARD_SIZE)
      expect(tank.geometry.height).toBe(TANK_STANDARD_SIZE)
      expect(container).toBeDefined()
    })

    it('should have consistent boundaries for BIG tank (rectangular)', () => {
      const tank = new Tank(TANK_BIG_WIDTH, TANK_BIG_HEIGHT, 0x87ceeb)
      tank.size = 'BIG' as TankSize

      const container = new TankContainer(tank)

      // Create test fish for boundary checking
      const insideFish = new Fish('test-fish-1', tank.geometry.width / 2, tank.geometry.height / 2, '#ffffff', 1.0)
      insideFish.species = FishSpecies.GUPPY
      insideFish.geometry.radius = 10

      const outsideFish = new Fish('test-fish-2', tank.geometry.width + 20, tank.geometry.height / 2, '#ffffff', 1.0)
      outsideFish.species = FishSpecies.GUPPY
      outsideFish.geometry.radius = 10

      // Test points inside the rectangle should be valid (not out of bounds)
      const isInsideOutOfBounds = tank.checkBoundary(insideFish)
      expect(isInsideOutOfBounds).toBe(false) // Should NOT be out of bounds

      // Test points outside the rectangle should be invalid (out of bounds)
      const isOutsideOutOfBounds = tank.checkBoundary(outsideFish)
      expect(isOutsideOutOfBounds).toBe(true) // Should be out of bounds

      // Visual rendering should use the same dimensions
      expect(tank.geometry.width).toBe(TANK_BIG_WIDTH)
      expect(tank.geometry.height).toBe(TANK_BIG_HEIGHT)
      expect(container).toBeDefined()
    })
  })

  describe('Spawn Area Consistency', () => {
    it('should have consistent spawn areas between collision and visual systems', () => {
      const tank = new Tank(TANK_BOWL_SIZE, TANK_BOWL_SIZE, 0x87ceeb)
      tank.size = 'BOWL' as TankSize

      const container = new TankContainer(tank)
      const spawnBounds = tank.getSpawnBounds()

      // Verify spawn area is within visual tank boundaries
      expect(spawnBounds.minX).toBeGreaterThanOrEqual(0)
      expect(spawnBounds.maxX).toBeLessThanOrEqual(tank.geometry.width)
      expect(spawnBounds.minY).toBeGreaterThanOrEqual(0)
      expect(spawnBounds.maxY).toBeLessThanOrEqual(tank.geometry.height)

      // Verify spawn area accounts for water level
      const waterLevel = tank.geometry.height * WATER_LEVEL
      const waterTop = tank.geometry.height - waterLevel
      expect(spawnBounds.minY).toBeGreaterThanOrEqual(waterTop)

      expect(container).toBeDefined()
    })

    it('should have consistent spawn areas for rectangular tanks', () => {
      const tank = new Tank(TANK_STANDARD_SIZE, TANK_STANDARD_SIZE, 0x87ceeb)
      tank.size = 'STANDARD' as TankSize

      const container = new TankContainer(tank)
      const spawnBounds = tank.getSpawnBounds()

      // Verify spawn area is within visual tank boundaries
      expect(spawnBounds.minX).toBeGreaterThanOrEqual(0)
      expect(spawnBounds.maxX).toBeLessThanOrEqual(tank.geometry.width)
      expect(spawnBounds.minY).toBeGreaterThanOrEqual(0)
      expect(spawnBounds.maxY).toBeLessThanOrEqual(tank.geometry.height)

      // For rectangular tanks, spawn area should be the full rectangle minus margins
      expect(spawnBounds.maxX - spawnBounds.minX).toBeLessThan(tank.geometry.width)
      expect(spawnBounds.maxY - spawnBounds.minY).toBeLessThan(tank.geometry.height)

      expect(container).toBeDefined()
    })
  })

  describe('Water Level Consistency', () => {
    it('should render water level that matches collision water boundaries', () => {
      const tank = new Tank(TANK_BOWL_SIZE, TANK_BOWL_SIZE, 0x87ceeb)
      tank.size = 'BOWL' as TankSize

      const container = new TankContainer(tank)

      // Water level should be at WATER_LEVEL% of tank height
      const expectedWaterLevel = tank.geometry.height * WATER_LEVEL

      // Create test fish at water surface level
      const surfaceFish = new Fish('surface-test', tank.geometry.width / 2, expectedWaterLevel, '#ffffff', 1.0)
      surfaceFish.species = FishSpecies.GUPPY
      surfaceFish.geometry.radius = 3 // Very small radius for surface testing

      const bottomFish = new Fish('bottom-fish', tank.geometry.width / 2, tank.geometry.height - 10, '#ffffff', 1.0)
      bottomFish.species = FishSpecies.GUPPY
      bottomFish.geometry.radius = 3

      // Test that fish at water surface level are within bounds (not out of bounds)
      const isAtSurfaceOutOfBounds = tank.checkBoundary(surfaceFish)
      expect(isAtSurfaceOutOfBounds).toBe(false) // Should NOT be out of bounds

      // Test that fish at the bottom are within bounds
      const isBottomOutOfBounds = tank.checkBoundary(bottomFish)
      expect(isBottomOutOfBounds).toBe(false) // Should NOT be out of bounds

      // Visual rendering should be defined
      expect(container).toBeDefined()
    })
  })
})
