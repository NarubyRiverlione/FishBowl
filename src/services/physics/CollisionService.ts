import { IFish } from '../../models/types/fish'
import { ITank } from '../../models/types/tank'
import { WATER_LEVEL } from '../../lib/constants'

export const detectFishCollision = (f1: IFish, f2: IFish): boolean => {
  const dx = f1.x - f2.x
  const dy = f1.y - f2.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < f1.radius + f2.radius
}

export const resolveBoundaryCollision = (fish: IFish, tank: ITank): void => {
  const restitution = 0.8 // Bounciness factor (0-1)
  const waterHeight = tank.height * WATER_LEVEL
  const waterTop = tank.height - waterHeight

  // Left wall
  if (fish.x - fish.radius < 0) {
    fish.x = fish.radius
    fish.vx *= -restitution
  }
  // Right wall
  else if (fish.x + fish.radius > tank.width) {
    fish.x = tank.width - fish.radius
    fish.vx *= -restitution
  }

  // Water surface (top boundary for fish)
  if (fish.y - fish.radius < waterTop) {
    fish.y = waterTop + fish.radius
    fish.vy *= -restitution
  }
  // Bottom wall
  else if (fish.y + fish.radius > tank.height) {
    fish.y = tank.height - fish.radius
    fish.vy *= -restitution
  }
}

export const resolveFishCollision = (f1: IFish, f2: IFish): void => {
  const dx = f2.x - f1.x
  const dy = f2.y - f1.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance === 0) return // Prevent division by zero

  const nx = dx / distance
  const ny = dy / distance

  const tx = -ny
  const ty = nx

  const dpTan1 = f1.vx * tx + f1.vy * ty
  const dpTan2 = f2.vx * tx + f2.vy * ty

  const dpNorm1 = f1.vx * nx + f1.vy * ny
  const dpNorm2 = f2.vx * nx + f2.vy * ny

  const m1 = f1.mass
  const m2 = f2.mass

  const mom1 = (dpNorm1 * (m1 - m2) + 2 * m2 * dpNorm2) / (m1 + m2)
  const mom2 = (dpNorm2 * (m2 - m1) + 2 * m1 * dpNorm1) / (m1 + m2)

  f1.vx = tx * dpTan1 + nx * mom1
  f1.vy = ty * dpTan1 + ny * mom1
  f2.vx = tx * dpTan2 + nx * mom2
  f2.vy = ty * dpTan2 + ny * mom2

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

export default {
  detectFishCollision,
  resolveBoundaryCollision,
  resolveFishCollision,
}
