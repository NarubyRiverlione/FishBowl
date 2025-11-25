import { describe, it, expect } from 'vitest'
import {
  detectFishCollision,
  resolveBoundaryCollision,
  resolveFishCollision,
} from '../../src/services/physics/CollisionService'
import { IFishLogic, FishSpecies } from '../../src/models/types/fish'
import { ITankLogic } from '../../src/models/types/tank'
import { FISH_BASE_RADIUS, COLLISION_BOUNDARY_BUFFER, SPAWN_MARGIN_BUFFER, WATER_LEVEL } from '../../src/lib/constants'

const mockFish = (props: Partial<IFishLogic> = {}): IFishLogic => {
  const baseRadius = FISH_BASE_RADIUS * 0.5 // Half-size fish for testing
  return {
    id: '1',
    species: FishSpecies.GUPPY,
    name: 'Test Fish',
    color: '#000000',
    size: 0.5,
    age: 0,
    health: 100,
    hunger: 0,
    isAlive: true,
    genetics: {},
    createdAt: Date.now(),
    lastFedAt: Date.now(),
    geometry: {
      position: { x: 0, y: 0 },
      velocity: { vx: 0, vy: 0 },
      radius: baseRadius,
    },
    // Backward compatibility properties
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: baseRadius,
    // Mock methods required by IFishLogic
    update: () => { },
    getEffectiveRadius: () => baseRadius,
    swim: () => { },
    ...props,
  }
}

const mockTank = (width: number, height: number): ITankLogic => ({
  id: 'test-tank',
  size: 'STANDARD',
  capacity: 10,
  createdAt: Date.now(),
  geometry: { width, height, centerX: width / 2, centerY: height / 2 },
  waterQuality: 100,
  pollution: 0,
  hasFilter: false,
  temperature: 24,
  backgroundColor: 0x87ceeb,
  fish: [],
  collisionChecks: 0,
  collisionsResolved: 0,
  addFish: () => { },
  removeFish: () => { },
  update: () => { },
  checkBoundary: () => false,
  resolveBoundary: (fish: IFishLogic) => {
    const effectiveRadius = fish.getEffectiveRadius?.() ?? fish.radius
    // Simple boundary resolution for tests
    if (fish.x <= effectiveRadius) {
      fish.x = effectiveRadius + COLLISION_BOUNDARY_BUFFER
      fish.vx = Math.abs(fish.vx) * 0.8
    }
    if (fish.x >= width - effectiveRadius) {
      fish.x = width - effectiveRadius - COLLISION_BOUNDARY_BUFFER
      fish.vx = -Math.abs(fish.vx) * 0.8
    }
    if (fish.y >= height - effectiveRadius) {
      fish.y = height - effectiveRadius - COLLISION_BOUNDARY_BUFFER
      fish.vy = -Math.abs(fish.vy) * 0.2
    }
    // Water surface at (1 - WATER_LEVEL) from top
    const waterTop = height * (1 - WATER_LEVEL)
    if (fish.y <= waterTop + effectiveRadius) {
      fish.y = waterTop + effectiveRadius + COLLISION_BOUNDARY_BUFFER
      fish.vy = Math.abs(fish.vy) * 0.8
    }
  },
  getSpawnBounds: () => ({
    minX: SPAWN_MARGIN_BUFFER,
    maxX: width - SPAWN_MARGIN_BUFFER,
    minY: SPAWN_MARGIN_BUFFER,
    maxY: height - SPAWN_MARGIN_BUFFER,
  }),
  floor: {
    visible: false,
    type: 'invisible',
    geometry: {
      x: 0,
      y: height - 1,
      width: width,
      height: 1,
    },
    restitution: 0.2,
    friction: 0.002,
  },
  shape: {
    type: 'rectangular',
    checkBoundary: () => false,
    resolveBoundary: () => { },
    getSpawnBounds: () => ({ minX: 0, maxX: width, minY: 0, maxY: height }),
  },
})

describe('Collision Utilities', () => {
  describe('detectFishCollision', () => {
    it('should return false for all fish pairs (disabled for 3D depth illusion)', () => {
      const radius1 = FISH_BASE_RADIUS * 0.5
      const f1 = mockFish({ x: 0, y: 0, radius: radius1, getEffectiveRadius: () => radius1 })
      const f2 = mockFish({ x: radius1 * 1.5, y: 0, radius: radius1, getEffectiveRadius: () => radius1 })
      expect(detectFishCollision(f1, f2)).toBe(false)
    })

    it('should return false if fish do not overlap', () => {
      const radius1 = FISH_BASE_RADIUS * 0.5
      const f1 = mockFish({ x: 0, y: 0, radius: radius1, getEffectiveRadius: () => radius1 })
      const f2 = mockFish({ x: radius1 * 2.5, y: 0, radius: radius1, getEffectiveRadius: () => radius1 })
      expect(detectFishCollision(f1, f2)).toBe(false)
    })
  })

  describe('resolveBoundaryCollision', () => {
    it('should reverse vx if hitting x boundary', () => {
      const radius = FISH_BASE_RADIUS * 0.5
      const fish = mockFish({ x: radius, vx: -10, radius, getEffectiveRadius: () => radius })
      const tank = mockTank(100, 100)
      resolveBoundaryCollision(fish, tank)
      const expectedVx = 10 * 0.8
      expect(fish.vx).toBeCloseTo(expectedVx)
      expect(fish.x).toBeCloseTo(radius + COLLISION_BOUNDARY_BUFFER)
    })

    it('should reverse vy if hitting y boundary (with floor restitution)', () => {
      const radius = FISH_BASE_RADIUS * 0.5
      const tankHeight = 100
      const fish = mockFish({ y: tankHeight - radius, vy: 10, radius, getEffectiveRadius: () => radius })
      const tank = mockTank(100, tankHeight)
      resolveBoundaryCollision(fish, tank)
      const expectedVy = -10 * 0.2
      expect(fish.vy).toBeCloseTo(expectedVy)
      expect(fish.y).toBeCloseTo(tankHeight - radius - COLLISION_BOUNDARY_BUFFER)
    })

    it('should prevent fish from going above water level', () => {
      const radius = FISH_BASE_RADIUS * 0.5
      const tankHeight = 100
      const waterTop = tankHeight * (1 - WATER_LEVEL)
      const fish = mockFish({ y: waterTop + radius, vy: -5, radius, getEffectiveRadius: () => radius })
      const tank = mockTank(100, tankHeight)
      resolveBoundaryCollision(fish, tank)

      const expectedY = waterTop + radius + COLLISION_BOUNDARY_BUFFER
      const expectedVy = 5 * 0.8
      expect(fish.y).toBeCloseTo(expectedY)
      expect(fish.vy).toBeCloseTo(expectedVy)
    })
  })

  describe('resolveFishCollision', () => {
    it('should not change velocities (fish collision disabled)', () => {
      const f1 = mockFish({ x: 0, vx: 10 })
      const f2 = mockFish({ x: 20, vx: -10 })

      const originalF1vx = f1.vx
      const originalF2vx = f2.vx

      resolveFishCollision(f1, f2)

      // Velocities should remain unchanged since fish collision is disabled
      expect(f1.vx).toBe(originalF1vx)
      expect(f2.vx).toBe(originalF2vx)
    })
  })
})
