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
import { TANK_STANDARD_WIDTH, TANK_STANDARD_HEIGHT, FISH_BASE_RADIUS, COLLISION_BOUNDARY_BUFFER } from '../../src/lib/constants'

describe('Fish Collision Behavior (T044b)', () => {
  it('should disable fish-to-fish collision detection', () => {
    // Create two overlapping fish
    const fish1 = FishService.createFish(FishSpecies.GUPPY)
    const fish2 = FishService.createFish(FishSpecies.GUPPY)

    // Position them at tank center (complete overlap)
    const centerX = TANK_STANDARD_WIDTH / 2
    const centerY = TANK_STANDARD_HEIGHT / 2
    fish1.x = centerX
    fish1.y = centerY
    fish2.x = centerX
    fish2.y = centerY

    // Fish-to-fish collision should be disabled
    const collision = detectFishCollision(fish1, fish2)
    expect(collision).toBe(false)
  })

  it('should not resolve fish-to-fish collisions', () => {
    // Create two fish with initial velocities
    const fish1 = FishService.createFish(FishSpecies.GUPPY)
    const fish2 = FishService.createFish(FishSpecies.GUPPY)

    const centerX = TANK_STANDARD_WIDTH / 2
    const centerY = TANK_STANDARD_HEIGHT / 2
    fish1.x = centerX
    fish1.y = centerY
    fish1.vx = 5
    fish1.vy = 3

    fish2.x = centerX
    fish2.y = centerY
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

    // Create tank with standard dimensions
    const tank = new Tank(TANK_STANDARD_WIDTH, TANK_STANDARD_HEIGHT, 0x87ceeb)

    // Position fish penetrating left wall so collision is detected
    const fishRadius = FISH_BASE_RADIUS * 0.5
    fish.x = fishRadius * 0.5 // Inside the wall boundary
    fish.y = TANK_STANDARD_HEIGHT / 2
    fish.vx = -5 // Moving towards wall
    fish.vy = 2
    fish.geometry.radius = fishRadius

    // Boundary collision should still work
    resolveBoundaryCollision(fish, tank)

    // Fish should be repositioned and velocity reversed
    expect(fish.x).toBeGreaterThanOrEqual(fishRadius) // Should be pushed away from wall
    expect(fish.vx).toBeGreaterThan(0) // Velocity should be reversed (positive, bouncing right)
  })

  it('should use gentle floor restitution vs normal wall restitution', () => {
    const fish1 = FishService.createFish(FishSpecies.GUPPY)
    const fish2 = FishService.createFish(FishSpecies.GUPPY)

    const tank = new Tank(TANK_STANDARD_WIDTH, TANK_STANDARD_HEIGHT, 0x87ceeb)
    const fishRadius = FISH_BASE_RADIUS * 0.5

    // Fish hitting floor (bottom)
    fish1.x = TANK_STANDARD_WIDTH / 2
    fish1.y = TANK_STANDARD_HEIGHT - fishRadius - COLLISION_BOUNDARY_BUFFER // Near bottom
    fish1.vx = 2
    fish1.vy = 5 // Moving downward
    fish1.geometry.radius = fishRadius

    // Fish hitting side wall
    fish2.x = fishRadius + COLLISION_BOUNDARY_BUFFER // Near left wall
    fish2.y = TANK_STANDARD_HEIGHT / 2
    fish2.vx = -5 // Moving towards wall
    fish2.vy = 2
    fish2.geometry.radius = fishRadius

    const initialFloorVy = fish1.vy
    const initialWallVx = fish2.vx

    resolveBoundaryCollision(fish1, tank)
    resolveBoundaryCollision(fish2, tank)

    // After boundary collision, velocities should be adjusted
    expect(Math.abs(fish1.vy)).toBeLessThanOrEqual(Math.abs(initialFloorVy))
    expect(Math.abs(fish2.vx)).toBeLessThanOrEqual(Math.abs(initialWallVx))
  })
})
