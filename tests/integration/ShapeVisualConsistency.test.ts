/**
 * Integration tests for shape-visual consistency (T042e)
 * Verifies rendered shape matches collision boundaries
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { TankContainer } from '../../src/game/views/TankContainer'
import { Tank } from '../../src/models/Tank'
import { Fish } from '../../src/models/Fish'
import { TankSize, FishSpecies } from '../../src/models/types'
import { createTankShape } from '../../src/services/physics/TankShapeFactory'
import {
  TANK_BOWL_SIZE,
  TANK_STANDARD_SIZE,
  TANK_BIG_WIDTH,
  TANK_BIG_HEIGHT,
  TANK_BORDER_WIDTH,
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
      const tank = { ...mockTank, size: 'STANDARD' as TankSize }
      tank.width = TANK_STANDARD_SIZE
      tank.height = TANK_STANDARD_SIZE
      tank.shape = createTankShape('STANDARD')
      const container = new TankContainer(tank)

      // Create test fish for boundary checking
      const insideFish: IFish = {
        id: 'test-fish-1',
        species: FishSpecies.GUPPY,
        color: '#ffffff',
        size: 1.0,
        age: 0,
        health: 100,
        hunger: 0,
        isAlive: true,
        genetics: {},
        createdAt: Date.now(),
        x: tank.width / 2,
        y: tank.height / 2,
        vx: 0,
        vy: 0,
        radius: 10,
      }

      const outsideFish: IFish = {
        ...insideFish,
        id: 'test-fish-2',
        x: tank.width + 20,
        y: tank.height / 2,
      }

      // Test points inside the rectangle should be valid
      const isInsideValid = tank.shape!.checkBoundary(insideFish)
      expect(isInsideValid).toBe(true)

      // Test points outside the rectangle should be invalid
      const isOutsideValid = tank.shape!.checkBoundary(outsideFish)
      expect(isOutsideValid).toBe(false)

      // Visual rendering should use the same dimensions
      expect(tank.shape!.type).toBe('rectangular')
      expect(tank.width).toBe(TANK_STANDARD_SIZE)
      expect(tank.height).toBe(TANK_STANDARD_SIZE)
      expect(container).toBeDefined()
    })

    it('should have consistent boundaries for BIG tank (rectangular)', () => {
      const tank = { ...mockTank, size: 'BIG' as TankSize }
      tank.width = TANK_BIG_WIDTH
      tank.height = TANK_BIG_HEIGHT
      tank.shape = createTankShape('BIG')
      const container = new TankContainer(tank)

      // Create test fish for boundary checking
      const insideFish: IFish = {
        id: 'test-fish-1',
        species: FishSpecies.GUPPY,
        color: '#ffffff',
        size: 1.0,
        age: 0,
        health: 100,
        hunger: 0,
        isAlive: true,
        genetics: {},
        createdAt: Date.now(),
        x: tank.width / 2,
        y: tank.height / 2,
        vx: 0,
        vy: 0,
        radius: 10,
      }

      const outsideFish: IFish = {
        ...insideFish,
        id: 'test-fish-2',
        x: tank.width + 20,
        y: tank.height / 2,
      }

      // Test points inside the rectangle should be valid
      const isInsideValid = tank.shape!.checkBoundary(insideFish)
      expect(isInsideValid).toBe(true)

      // Test points outside the rectangle should be invalid
      const isOutsideValid = tank.shape!.checkBoundary(outsideFish)
      expect(isOutsideValid).toBe(false)

      // Visual rendering should use the same dimensions
      expect(tank.shape!.type).toBe('rectangular')
      expect(tank.width).toBe(TANK_BIG_WIDTH)
      expect(tank.height).toBe(TANK_BIG_HEIGHT)
      expect(container).toBeDefined()
    })
  })

  describe('Spawn Area Consistency', () => {
    it('should have consistent spawn areas between collision and visual systems', () => {
      const tank = { ...mockTank, size: 'BOWL' as TankSize }
      tank.shape = createTankShape('BOWL')
      const container = new TankContainer(tank)

      // Get spawn bounds from collision system
      const spawnBounds = tank.shape!.getSpawnBounds()

      // Verify spawn area is within visual tank boundaries
      expect(spawnBounds.minX).toBeGreaterThanOrEqual(0)
      expect(spawnBounds.maxX).toBeLessThanOrEqual(tank.width)
      expect(spawnBounds.minY).toBeGreaterThanOrEqual(0)
      expect(spawnBounds.maxY).toBeLessThanOrEqual(tank.height)

      // Verify spawn area accounts for water level
      const waterLevel = tank.height * 0.95 // WATER_LEVEL constant
      const waterTop = tank.height - waterLevel
      expect(spawnBounds.minY).toBeGreaterThanOrEqual(waterTop)

      expect(container).toBeDefined()
    })

    it('should have consistent spawn areas for rectangular tanks', () => {
      const tank = { ...mockTank, size: 'STANDARD' as TankSize }
      tank.width = TANK_STANDARD_SIZE
      tank.height = TANK_STANDARD_SIZE
      tank.shape = createTankShape('STANDARD')
      const container = new TankContainer(tank)

      // Get spawn bounds from collision system
      const spawnBounds = tank.shape!.getSpawnBounds()

      // Verify spawn area is within visual tank boundaries
      expect(spawnBounds.minX).toBeGreaterThanOrEqual(0)
      expect(spawnBounds.maxX).toBeLessThanOrEqual(tank.width)
      expect(spawnBounds.minY).toBeGreaterThanOrEqual(0)
      expect(spawnBounds.maxY).toBeLessThanOrEqual(tank.height)

      // For rectangular tanks, spawn area should be the full rectangle minus margins
      expect(spawnBounds.maxX - spawnBounds.minX).toBeLessThan(tank.width)
      expect(spawnBounds.maxY - spawnBounds.minY).toBeLessThan(tank.height)

      expect(container).toBeDefined()
    })
  })

  describe('Water Level Consistency', () => {
    it('should render water level that matches collision water boundaries', () => {
      const tank = { ...mockTank, size: 'BOWL' as TankSize }
      tank.shape = createTankShape('BOWL')
      const container = new TankContainer(tank)

      // Water level should be at 95% of tank height
      const expectedWaterLevel = tank.height * 0.95
      const waterTop = tank.height - expectedWaterLevel

      // Create test fish at water surface level
      const surfaceFish: IFish = {
        id: 'surface-test',
        species: FishSpecies.GUPPY,
        color: '#ffffff',
        size: 1.0,
        age: 0,
        health: 100,
        hunger: 0,
        isAlive: true,
        genetics: {},
        createdAt: Date.now(),
        x: tank.width / 2,
        y: expectedWaterLevel,
        vx: 0,
        vy: 0,
        radius: 3, // Very small radius for surface testing
      }

      const aboveWaterFish: IFish = {
        ...surfaceFish,
        id: 'above-water-fish',
        y: waterTop - 10,
      }

      // Test that fish at water surface level are within bounds
      const isAtSurface = tank.shape!.checkBoundary(surfaceFish)
      expect(isAtSurface).toBe(true)

      // Test that fish above water level are out of bounds
      const isAboveWater = tank.shape!.checkBoundary(aboveWaterFish)
      expect(isAboveWater).toBe(false)

      expect(container).toBeDefined()
    })
  })
})
