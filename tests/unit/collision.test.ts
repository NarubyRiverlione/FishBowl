import { describe, it, expect } from 'vitest'
import { detectFishCollision, resolveBoundaryCollision, resolveFishCollision } from '../../src/lib/collision'
import { IFish } from '../../src/types/fish'

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
    it('should return true if fish overlap', () => {
      const f1 = mockFish({ x: 0, y: 0, radius: 10 })
      const f2 = mockFish({ x: 15, y: 0, radius: 10 }) // Distance 15 < 20
      expect(detectFishCollision(f1, f2)).toBe(true)
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
      expect(fish.vx).toBe(10) // Reversed
      expect(fish.x).toBe(10) // Pushed back
    })

    it('should reverse vy if hitting y boundary', () => {
      const fish = mockFish({ y: 95, vy: 10, radius: 10 })
      resolveBoundaryCollision(fish, { width: 100, height: 100, backgroundColor: 0 })
      expect(fish.vy).toBe(-10) // Reversed
      expect(fish.y).toBe(90) // Pushed back
    })
  })

  describe('resolveFishCollision', () => {
    it('should swap velocities for equal mass head-on collision', () => {
      const f1 = mockFish({ x: 0, vx: 10, mass: 1 })
      const f2 = mockFish({ x: 20, vx: -10, mass: 1 })
      resolveFishCollision(f1, f2)
      expect(f1.vx).toBeLessThan(0)
      expect(f2.vx).toBeGreaterThan(0)
    })
  })
})
