/**
 * Updates velocity based on acceleration and friction.
 * @param velocity Current velocity
 * @param acceleration Acceleration to apply
 * @param friction Friction coefficient (0 to 1)
 * @returns New velocity
 */
export const updateVelocity = (velocity: number, acceleration: number, friction: number): number => {
  return (velocity + acceleration) * (1 - friction)
}

/**
 * Calculates acceleration based on force and mass (F = ma -> a = F/m).
 * @param force Force applied
 * @param mass Mass of the object
 * @returns Acceleration
 */
export const calculateAcceleration = (force: number, mass: number): number => {
  if (mass === 0) return 0
  return force / mass
}

/**
 * Detects collision with 1D boundaries.
 * @param position Current position
 * @param radius Object radius
 * @param minBound Minimum boundary
 * @param maxBound Maximum boundary
 * @returns 'min' | 'max' | null
 */
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
