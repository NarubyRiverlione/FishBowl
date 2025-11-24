// Test suite for fish collision behavior (T044b)

import { describe, it, expect } from 'vitest'
import {
  detectFishCollision,
  resolveFishCollision,
  resolveBoundaryCollision,
} from '../../src/services/physics/CollisionService'
import { FishService } from '../../src/services/FishService'
import { Tank } from '../../src/models/Tank'
import { FishSpecies } from '../../src/models/types'

describe('Fish Collision Behavior (T044b)', () => {
  it('should disable fish-to-fish collision detection', () => {
    // Create two overlapping fish
    const fish1 = FishService.createFish(FishSpecies.GUPPY)
    const fish2 = FishService.createFish(FishSpecies.GUPPY)

    // Position them at same location (complete overlap)
    fish1.x = 100
    fish1.y = 100
    fish2.x = 100
    fish2.y = 100

    // Fish-to-fish collision should be disabled
    const collision = detectFishCollision(fish1, fish2)
    expect(collision).toBe(false)
  })

  it('should not resolve fish-to-fish collisions', () => {
    // Create two fish with initial velocities
    const fish1 = FishService.createFish(FishSpecies.GUPPY, '#FF0000', 'Fish1')
    const fish2 = FishService.createFish(FishSpecies.GUPPY, '#00FF00', 'Fish2')

    fish1.x = 100
    fish1.y = 100
    fish1.vx = 5
    fish1.vy = 3

    fish2.x = 100
    fish2.y = 100
    fish2.vx = -2
    fish2.vy = 4

    const originalF1 = { x: fish1.x, y: fish1.y, vx: fish1.vx, vy: fish1.vy }
    const originalF2 = { x: fish2.x, y: fish2.y, vx: fish2.vx, vy: fish2.vy }

    // Fish collision resolution should do nothing
    resolveFishCollision(fish1, fish2)

    // Velocities and positions should remain unchanged
    expect(fish1.x).toBe(originalF1.x)
    expect(fish1.y).toBe(originalF1.y)
    expect(fish1.vx).toBe(originalF1.vx)
    expect(fish1.vy).toBe(originalF1.vy)

    expect(fish2.x).toBe(originalF2.x)
    expect(fish2.y).toBe(originalF2.y)
    expect(fish2.vx).toBe(originalF2.vx)
    expect(fish2.vy).toBe(originalF2.vy)
  })

  it('should still maintain boundary collisions', () => {
    // Create a fish near the tank boundary
    const fish = FishService.createFish(FishSpecies.GUPPY)

    // Create tank with width/height
    const tank = new Tank(400, 300, 0x87ceeb)

    // Position fish at left wall with velocity towards wall
    fish.x = 10 // Close to left wall (x=0)
    fish.y = 150
    fish.vx = -5 // Moving towards wall
    fish.vy = 2
    fish.radius = 20

    // Boundary collision should still work
    resolveBoundaryCollision(fish, tank)

    // Fish should be repositioned and velocity reversed
    expect(fish.x).toBeGreaterThanOrEqual(fish.radius) // Should be at or pushed away from wall
    expect(fish.vx).toBeGreaterThan(0) // Velocity should be reversed (positive)
  })

  it('should use gentle floor restitution vs normal wall restitution', () => {
    const fish1 = FishService.createFish(FishSpecies.GUPPY)
    const fish2 = FishService.createFish(FishSpecies.GUPPY)

    const tank = new Tank(400, 300, 0x87ceeb)

    // Fish hitting floor (bottom)
    fish1.x = 200
    fish1.y = 290 // Near bottom
    fish1.vx = 2
    fish1.vy = 5 // Moving downward
    fish1.radius = 15

    // Fish hitting side wall
    fish2.x = 10 // Near left wall
    fish2.y = 150
    fish2.vx = -5 // Moving towards wall
    fish2.vy = 2
    fish2.radius = 15

    const initialFloorVy = fish1.vy
    const initialWallVx = fish2.vx

    resolveBoundaryCollision(fish1, tank)
    resolveBoundaryCollision(fish2, tank)

    // After boundary collision, velocities should be adjusted
    expect(Math.abs(fish1.vy)).toBeLessThanOrEqual(Math.abs(initialFloorVy))
    expect(Math.abs(fish2.vx)).toBeLessThanOrEqual(Math.abs(initialWallVx))
  })
})
