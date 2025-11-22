import { describe, it, expect } from 'vitest'
import {
  detectFishCollision,
  resolveBoundaryCollision,
  resolveFishCollision,
} from '../../src/services/physics/CollisionService'
import { IFish } from '../../src/models/types/fish'

const mockFish = (props: Partial<IFish> = {}): IFish => ({
  id: '1',
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  scale: 1,
  color: '#000000',
  width: 10,
  height: 10,
  mass: 1,
  radius: 5,
  update: () => {},
  ...props,
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
      resolveBoundaryCollision(fish, { width: 100, height: 100, backgroundColor: 0 })
      expect(fish.vx).toBe(8) // Reversed with restitution 0.8
      expect(fish.x).toBe(12) // Pushed back to radius(10) + buffer(2) = 12
    })

    it('should reverse vy if hitting y boundary (with floor restitution)', () => {
      const fish = mockFish({ y: 95, vy: 10, radius: 10 })
      resolveBoundaryCollision(fish, { width: 100, height: 100, backgroundColor: 0 })
      expect(fish.vy).toBe(-2) // Reversed with floor restitution 0.2
      expect(fish.y).toBe(88) // Pushed back to height(100) - radius(10) - buffer(2) = 88
    })

    it('should prevent fish from going above water level', () => {
      // Tank height 100, water level 95% = 95px high, top at y=5
      const fish = mockFish({ y: 10, vy: -5, radius: 10 })
      resolveBoundaryCollision(fish, { width: 100, height: 100, backgroundColor: 0 })

      // Fish should be pushed down to waterTop + radius + buffer
      // waterTop = 100 - (100 * 0.95) = 5
      // Expected y = 5 + 10 + 2 = 17
      expect(fish.y).toBe(17)
      expect(fish.vy).toBe(4) // Reversed with restitution 0.8
    })
  })

  describe('resolveFishCollision', () => {
    it('should not change velocities (fish collision disabled)', () => {
      const f1 = mockFish({ x: 0, vx: 10, mass: 1 })
      const f2 = mockFish({ x: 20, vx: -10, mass: 1 })
      
      const originalF1vx = f1.vx
      const originalF2vx = f2.vx
      
      resolveFishCollision(f1, f2)
      
      // Velocities should remain unchanged since fish collision is disabled
      expect(f1.vx).toBe(originalF1vx)
      expect(f2.vx).toBe(originalF2vx)
    })
  })
})
