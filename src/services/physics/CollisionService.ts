import { IFish, ITank } from '../../models/types'
import {
  WATER_LEVEL,
  FLOOR_RESTITUTION,
  WALL_RESTITUTION,
  COLLISION_BOUNDARY_BUFFER,
  USE_TANK_SHAPES,
} from '../../lib/constants'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const detectFishCollision = (_f1: IFish, _f2: IFish): boolean => {
  // T044a: Fish-to-fish collision disabled for 3D depth illusion
  // This allows visual overlap for more natural looking tank
  return false
}

export const resolveBoundaryCollision = (fish: IFish, tank: ITank): void => {
  // Phase 4c: Use tank shape abstraction if available and enabled
  if (USE_TANK_SHAPES && tank.shape) {
    tank.shape.resolveBoundary(fish)
    return
  }

  // Fallback to legacy rectangular collision logic
  const waterHeight = tank.height * WATER_LEVEL
  const waterTop = tank.height - waterHeight

  // Use effective radius that accounts for life stage scaling
  const effectiveRadius = fish.getEffectiveRadius ? fish.getEffectiveRadius() : fish.radius

  // Add larger safety buffer to prevent boundary violations
  const buffer = COLLISION_BOUNDARY_BUFFER

  // Debug logging for boundary violations in dev/test mode
  const wasViolating =
    fish.x - effectiveRadius < buffer ||
    fish.x + effectiveRadius > tank.width - buffer ||
    fish.y - effectiveRadius < waterTop + buffer ||
    fish.y + effectiveRadius > tank.height - buffer

  // Left wall - ensure fish stays within bounds with buffer
  if (fish.x - effectiveRadius < buffer) {
    fish.x = effectiveRadius + buffer
    fish.vx = Math.abs(fish.vx) * WALL_RESTITUTION // Force positive velocity
  }
  // Right wall - ensure fish stays within bounds with buffer
  else if (fish.x + effectiveRadius > tank.width - buffer) {
    fish.x = tank.width - effectiveRadius - buffer
    fish.vx = -Math.abs(fish.vx) * WALL_RESTITUTION // Force negative velocity
  }

  // Water surface (top boundary for fish)
  if (fish.y - effectiveRadius < waterTop + buffer) {
    fish.y = waterTop + effectiveRadius + buffer
    fish.vy = Math.abs(fish.vy) * WALL_RESTITUTION // Force downward
  }
  // Bottom floor (T041c: Use gentle floor restitution)
  else if (fish.y + effectiveRadius > tank.height - buffer) {
    fish.y = tank.height - effectiveRadius - buffer
    fish.vy = -Math.abs(fish.vy) * FLOOR_RESTITUTION // Force upward, gentle
  }

  // Log when corrections are made
  if (
    wasViolating &&
    typeof window !== 'undefined' &&
    (window as Window & { __TEST_HELPERS__?: unknown }).__TEST_HELPERS__
  ) {
    console.log('🔧 Collision correction applied:', {
      id: fish.id,
      newPos: { x: fish.x, y: fish.y },
      bounds: { waterTop, tankWidth: tank.width, tankHeight: tank.height },
      radius: effectiveRadius,
    })
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const resolveFishCollision = (_f1: IFish, _f2: IFish): void => {
  // T044a: Fish-to-fish collision disabled to allow visual overlap for 3D depth illusion
  // This function is kept for API compatibility but does nothing
  return
}

export default {
  detectFishCollision,
  resolveBoundaryCollision,
  resolveFishCollision,
}
