import { describe, it, expect } from 'vitest'
import {
  updateVelocity,
  calculateAcceleration,
  detectBoundaryCollision,
} from '../../src/services/physics/PhysicsService'

describe('Physics Utilities', () => {
  describe('updateVelocity', () => {
    it('should update velocity based on acceleration', () => {
      const v = updateVelocity(10, 2, 0)
      expect(v).toBe(12)
    })

    it('should apply friction', () => {
      const v = updateVelocity(10, 0, 0.1)
      expect(v).toBe(9)
    })
  })

  describe('calculateAcceleration', () => {
    it('should calculate acceleration from force and mass', () => {
      const a = calculateAcceleration(10, 2)
      expect(a).toBe(5)
    })

    it('should return 0 if mass is 0', () => {
      const a = calculateAcceleration(10, 0)
      expect(a).toBe(0)
    })
  })

  describe('detectBoundaryCollision', () => {
    it('should return null if inside bounds', () => {
      const collision = detectBoundaryCollision(50, 10, 0, 100)
      expect(collision).toBeNull()
    })

    it('should return "min" if colliding with min bound', () => {
      const collision = detectBoundaryCollision(5, 10, 0, 100)
      expect(collision).toBe('min')
    })

    it('should return "max" if colliding with max bound', () => {
      const collision = detectBoundaryCollision(95, 10, 0, 100)
      expect(collision).toBe('max')
    })
  })
})
