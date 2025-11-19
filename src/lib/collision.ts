import { IFish } from '../types/fish'
import { ITank } from '../types/tank'

/**
 * Detects if two fish are colliding (circle collision).
 * @param f1 Fish 1
 * @param f2 Fish 2
 * @returns True if colliding
 */
export const detectFishCollision = (f1: IFish, f2: IFish): boolean => {
  const dx = f1.x - f2.x
  const dy = f1.y - f2.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < f1.radius + f2.radius
}

/**
 * Resolves collision between a fish and tank boundaries.
 * Modifies fish position and velocity in place.
 * @param fish Fish to check
 * @param tank Tank boundaries
 */
export const resolveBoundaryCollision = (fish: IFish, tank: ITank): void => {
  // Left wall
  if (fish.x - fish.radius < 0) {
    fish.x = fish.radius
    fish.vx *= -1
  }
  // Right wall
  else if (fish.x + fish.radius > tank.width) {
    fish.x = tank.width - fish.radius
    fish.vx *= -1
  }

  // Top wall
  if (fish.y - fish.radius < 0) {
    fish.y = fish.radius
    fish.vy *= -1
  }
  // Bottom wall
  else if (fish.y + fish.radius > tank.height) {
    fish.y = tank.height - fish.radius
    fish.vy *= -1
  }
}

/**
 * Resolves collision between two fish (elastic collision).
 * Modifies fish velocities in place.
 * @param f1 Fish 1
 * @param f2 Fish 2
 */
export const resolveFishCollision = (f1: IFish, f2: IFish): void => {
  const dx = f2.x - f1.x
  const dy = f2.y - f1.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance === 0) return // Prevent division by zero

  // Normal vector
  const nx = dx / distance
  const ny = dy / distance

  // Tangent vector
  const tx = -ny
  const ty = nx

  // Dot product tangent
  const dpTan1 = f1.vx * tx + f1.vy * ty
  const dpTan2 = f2.vx * tx + f2.vy * ty

  // Dot product normal
  const dpNorm1 = f1.vx * nx + f1.vy * ny
  const dpNorm2 = f2.vx * nx + f2.vy * ny

  // Conservation of momentum in 1D
  const m1 = f1.mass
  const m2 = f2.mass

  const mom1 = (dpNorm1 * (m1 - m2) + 2 * m2 * dpNorm2) / (m1 + m2)
  const mom2 = (dpNorm2 * (m2 - m1) + 2 * m1 * dpNorm1) / (m1 + m2)

  // Update velocities
  f1.vx = tx * dpTan1 + nx * mom1
  f1.vy = ty * dpTan1 + ny * mom1
  f2.vx = tx * dpTan2 + nx * mom2
  f2.vy = ty * dpTan2 + ny * mom2

  // Separate fish to prevent sticking (overlap correction)
  const overlap = f1.radius + f2.radius - distance
  if (overlap > 0) {
    const separationX = (overlap * nx) / 2
    const separationY = (overlap * ny) / 2
    f1.x -= separationX
    f1.y -= separationY
    f2.x += separationX
    f2.y += separationY
  }
}
