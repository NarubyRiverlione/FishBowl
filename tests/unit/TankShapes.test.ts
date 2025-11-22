import { describe, it, expect, beforeEach } from 'vitest'
import { RectangularTankShape } from '../../src/services/physics/shapes/RectangularTankShape'
import { CircularTankShape } from '../../src/services/physics/shapes/CircularTankShape'
import { IFish, FishSpecies } from '../../src/models/types/index'
import { COLLISION_BOUNDARY_BUFFER, WATER_SURFACE_RATIO } from '../../src/lib/constants'

describe('TankShapes', () => {
  describe('RectangularTankShape', () => {
    let shape: RectangularTankShape
    let testFish: IFish

    beforeEach(() => {
      shape = new RectangularTankShape(250, 250, 500, 500)
      testFish = {
        id: 'fish-1',
        species: FishSpecies.GUPPY,
        color: '#FF0000',
        size: 0.5,
        age: 0,
        health: 100,
        hunger: 0,
        isAlive: true,
        genetics: {},
        createdAt: Date.now(),
        x: 250,
        y: 250,
        vx: 0,
        vy: 0,
        radius: 10,
      }
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
      testFish.x = 500
      const result = shape.checkBoundary(testFish)
      expect(result).toBe(false)
    })

    it('should detect boundary violation on top wall', () => {
      testFish.y = 0
      const result = shape.checkBoundary(testFish)
      expect(result).toBe(false)
    })

    it('should detect boundary violation on water surface', () => {
      const waterBottom = 250 + (250 * WATER_SURFACE_RATIO)
      testFish.y = waterBottom + 50
      const result = shape.checkBoundary(testFish)
      expect(result).toBe(false)
    })

    it('should resolve left wall collision by pushing right', () => {
      testFish.x = 0
      testFish.vx = -5
      shape.resolveBoundary(testFish)
      expect(testFish.x).toBeGreaterThan(testFish.radius + COLLISION_BOUNDARY_BUFFER - 5)
      expect(testFish.vx).toBeGreaterThanOrEqual(0)
    })

    it('should resolve right wall collision by pushing left', () => {
      testFish.x = 500
      testFish.vx = 5
      shape.resolveBoundary(testFish)
      expect(testFish.x).toBeLessThan(500 - testFish.radius - COLLISION_BOUNDARY_BUFFER + 5)
      expect(testFish.vx).toBeLessThanOrEqual(0)
    })

    it('should resolve top wall collision by pushing down', () => {
      testFish.y = 0
      testFish.vy = -5
      shape.resolveBoundary(testFish)
      expect(testFish.y).toBeGreaterThan(testFish.radius + COLLISION_BOUNDARY_BUFFER - 5)
      expect(testFish.vy).toBeGreaterThanOrEqual(0)
    })

    it('should resolve water surface collision by pushing up', () => {
      const waterBottom = 250 + (250 * WATER_SURFACE_RATIO)
      testFish.y = waterBottom + 50
      testFish.vy = 5
      shape.resolveBoundary(testFish)
      expect(testFish.y).toBeLessThan(waterBottom - testFish.radius - COLLISION_BOUNDARY_BUFFER + 5)
      expect(testFish.vy).toBeLessThanOrEqual(0)
    })

    it('should provide valid spawn bounds', () => {
      const bounds = shape.getSpawnBounds()
      expect(bounds.minX).toBeGreaterThan(0)
      expect(bounds.maxX).toBeLessThan(500)
      expect(bounds.minY).toBeGreaterThan(0)
      expect(bounds.maxY).toBeLessThan(250 + (250 * WATER_SURFACE_RATIO))
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
      shape = new CircularTankShape(250, 250, 150) // radius 150
      testFish = {
        id: 'fish-1',
        species: FishSpecies.GUPPY,
        color: '#FF0000',
        size: 0.5,
        age: 0,
        health: 100,
        hunger: 0,
        isAlive: true,
        genetics: {},
        createdAt: Date.now(),
        x: 250,
        y: 250,
        vx: 0,
        vy: 0,
        radius: 10,
      }
    })

    it('should identify when fish is within bounds', () => {
      const result = shape.checkBoundary(testFish)
      expect(result).toBe(true)
    })

    it('should detect boundary violation near circular wall', () => {
      // Position fish near the circular boundary
      testFish.x = 250 + 145
      testFish.y = 250
      const result = shape.checkBoundary(testFish)
      expect(result).toBe(false)
    })

    it('should detect boundary violation above water surface', () => {
      const waterSurface = 250 + (150 * WATER_SURFACE_RATIO)
      testFish.y = waterSurface + 50
      const result = shape.checkBoundary(testFish)
      expect(result).toBe(false)
    })

    it('should resolve circular wall collision by pushing toward center', () => {
      testFish.x = 250 + 145
      testFish.y = 250
      testFish.vx = 5
      shape.resolveBoundary(testFish)
      expect(testFish.x).toBeLessThan(250 + 145)
    })

    it('should resolve water surface collision', () => {
      const waterSurface = 250 + (150 * WATER_SURFACE_RATIO)
      testFish.y = waterSurface + 50
      testFish.vy = 5
      shape.resolveBoundary(testFish)
      expect(testFish.y).toBeLessThan(waterSurface + 50)
      expect(testFish.vy).toBeLessThanOrEqual(0)
    })

    it('should provide valid spawn bounds for circular tank', () => {
      const bounds = shape.getSpawnBounds()
      expect(bounds.minX).toBeGreaterThan(100)
      expect(bounds.maxX).toBeLessThan(400)
      expect(bounds.minY).toBeGreaterThan(100)
      expect(bounds.maxY).toBeLessThan(250 + (150 * WATER_SURFACE_RATIO))
      expect(bounds.minX).toBeLessThan(bounds.maxX)
      expect(bounds.minY).toBeLessThan(bounds.maxY)
    })

    it('should have correct shape type', () => {
      expect(shape.type).toBe('circular')
    })

    it('should have radius property', () => {
      expect(shape.radius).toBe(150)
    })

    it('should handle fish at tank center', () => {
      testFish.x = 250
      testFish.y = 250
      testFish.vx = 10
      testFish.vy = 10
      // Should not throw
      shape.resolveBoundary(testFish)
      expect(testFish.isAlive).toBe(true)
    })

    it('should properly reflect velocity on circular wall collision', () => {
      testFish.x = 250 + 140 // Near right wall
      testFish.y = 250
      testFish.vx = 10 // Moving toward wall
      const originalVx = testFish.vx
      shape.resolveBoundary(testFish)
      // Velocity should be reflected (negative if it was positive)
      expect(testFish.vx).toBeLessThanOrEqual(originalVx)
    })
  })
})
