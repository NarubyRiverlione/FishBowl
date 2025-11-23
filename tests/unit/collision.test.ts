import { describe, it, expect } from 'vitest'
import {
  detectFishCollision,
  resolveBoundaryCollision,
  resolveFishCollision,
} from '../../src/services/physics/CollisionService'
import { IFishLogic, FishSpecies } from '../../src/models/types/fish'
import { ITankLogic } from '../../src/models/types/tank'

const mockFish = (props: Partial<IFishLogic> = {}): IFishLogic => ({
  id: '1',
  species: FishSpecies.GUPPY,
  name: 'Test Fish',
  color: '#000000',
  size: 1,
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
    radius: 5
  },
  // Backward compatibility properties
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  radius: 5,
  // Mock methods required by IFishLogic
  update: () => {},
  getEffectiveRadius: () => 5,
  swim: () => {},
  ...props,
})

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
  addFish: () => {},
  removeFish: () => {},
  update: () => {},
  checkBoundary: () => false,
  resolveBoundary: (fish: IFishLogic) => {
    // Simple boundary resolution for tests
    if (fish.x <= fish.radius) {
      fish.x = fish.radius + 2
      fish.vx = Math.abs(fish.vx) * 0.8
    }
    if (fish.x >= width - fish.radius) {
      fish.x = width - fish.radius - 2
      fish.vx = -Math.abs(fish.vx) * 0.8
    }
    if (fish.y >= height - fish.radius) {
      fish.y = height - fish.radius - 2
      fish.vy = -Math.abs(fish.vy) * 0.2
    }
    // Water surface at 5% from top
    const waterTop = height * 0.05
    if (fish.y <= waterTop + fish.radius) {
      fish.y = waterTop + fish.radius + 2
      fish.vy = Math.abs(fish.vy) * 0.8
    }
  },
  getSpawnBounds: () => ({ minX: 20, maxX: width - 20, minY: 20, maxY: height - 20 }),
})

describe('Collision Utilities', () => {
  describe('detectFishCollision', () => {
    it('should return false for all fish pairs (disabled for 3D depth illusion)', () => {
      const f1 = mockFish({ x: 0, y: 0, radius: 10 })
      const f2 = mockFish({ x: 15, y: 0, radius: 10 }) // Distance 15 < 20 (would overlap)
      expect(detectFishCollision(f1, f2)).toBe(false)
    })

    it('should return false if fish do not overlap', () => {
      const f1 = mockFish({ x: 0, y: 0, radius: 10 })
      const f2 = mockFish({ x: 25, y: 0, radius: 10 }) // Distance 25 > 20
      expect(detectFishCollision(f1, f2)).toBe(false)
    })
  })

  describe('resolveBoundaryCollision', () => {
    it('should reverse vx if hitting x boundary', () => {
      const fish = mockFish({ x: 5, vx: -10, radius: 10 })
      const tank = mockTank(100, 100)
      resolveBoundaryCollision(fish, tank)
      expect(fish.vx).toBe(8) // Reversed with restitution 0.8
      expect(fish.x).toBe(12) // Pushed back to radius(10) + buffer(2) = 12
    })

    it('should reverse vy if hitting y boundary (with floor restitution)', () => {
      const fish = mockFish({ y: 95, vy: 10, radius: 10 })
      const tank = mockTank(100, 100)
      resolveBoundaryCollision(fish, tank)
      expect(fish.vy).toBe(-2) // Reversed with floor restitution 0.2
      expect(fish.y).toBe(88) // Pushed back to height(100) - radius(10) - buffer(2) = 88
    })

    it('should prevent fish from going above water level', () => {
      // Tank height 100, water level at top 5% = y=5
      const fish = mockFish({ y: 10, vy: -5, radius: 10 })
      const tank = mockTank(100, 100)
      resolveBoundaryCollision(fish, tank)

      // Fish should be pushed down to waterTop + radius + buffer
      // waterTop = 100 * 0.05 = 5
      // Expected y = 5 + 10 + 2 = 17
      expect(fish.y).toBe(17)
      expect(fish.vy).toBe(4) // Reversed with restitution 0.8
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
