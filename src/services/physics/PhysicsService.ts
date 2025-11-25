/**
 * PhysicsService - pure physics helpers extracted from `src/lib/physics.ts`.
 */
export const updateVelocity = (velocity: number, acceleration: number, friction: number): number => {
  return (velocity + acceleration) * (1 - friction)
}

export const calculateAcceleration = (force: number, mass: number): number => {
  if (mass === 0) return 0
  return force / mass
}

export const detectBoundaryCollision = (
  position: number,
  radius: number,
  minBound: number,
  maxBound: number
): 'min' | 'max' | null => {
  if (position - radius < minBound) return 'min'
  if (position + radius > maxBound) return 'max'
  return null
}

export default {
  updateVelocity,
  calculateAcceleration,
  detectBoundaryCollision,
}
