import { IFishLogic } from '../../../models/types/index'
import { ITankShape, ISpawnBounds } from '../../../models/types/tankShape'
import { COLLISION_BOUNDARY_BUFFER, WALL_RESTITUTION } from '../../../lib/constants'

/**
 * RectangularTankShape represents rectangular tanks (STANDARD and BIG)
 * Uses simple axis-aligned bounding box collision detection
 */
export class RectangularTankShape implements ITankShape {
  readonly type = 'rectangular'

  private width: number
  private marginX: number
  private waterTop: number
  private waterBottom: number

  constructor(_centerX: number, _centerY: number, width: number, height: number) {
    // Note: centerX and centerY are passed for API consistency with other shape constructors,
    // but RectangularTankShape uses absolute margins rather than center-based positioning
    this.width = width

    // Margins based on recttank.svg (100x100 viewBox)
    // Water x: 6-94 (6% margin)
    // Water y: 20-94 (20% top margin, 6% bottom margin)
    this.marginX = width * 0.06
    this.waterTop = height * 0.2
    this.waterBottom = height * 0.94
  }

  checkBoundary(fish: IFishLogic): boolean {
    // Returns true if collision detected (fish out of bounds), false if within bounds
    return (
      fish.x - fish.radius <= this.marginX + COLLISION_BOUNDARY_BUFFER ||
      fish.x + fish.radius >= this.width - this.marginX - COLLISION_BOUNDARY_BUFFER ||
      fish.y - fish.radius <= this.waterTop + COLLISION_BOUNDARY_BUFFER ||
      fish.y + fish.radius >= this.waterBottom - COLLISION_BOUNDARY_BUFFER
    )
  }

  resolveBoundary(fish: IFishLogic): void {
    // Handle boundary collisions with restitution applied
    const restitution = WALL_RESTITUTION

    // Left wall collision
    if (fish.x - fish.radius <= this.marginX + COLLISION_BOUNDARY_BUFFER) {
      fish.x = this.marginX + fish.radius + COLLISION_BOUNDARY_BUFFER
      if (fish.vx < 0) {
        fish.vx = -fish.vx * restitution
      }
    }

    // Right wall collision
    if (fish.x + fish.radius >= this.width - this.marginX - COLLISION_BOUNDARY_BUFFER) {
      fish.x = this.width - this.marginX - fish.radius - COLLISION_BOUNDARY_BUFFER
      if (fish.vx > 0) {
        fish.vx = -fish.vx * restitution
      }
    }

    // Top water boundary collision
    if (fish.y - fish.radius <= this.waterTop + COLLISION_BOUNDARY_BUFFER) {
      fish.y = this.waterTop + fish.radius + COLLISION_BOUNDARY_BUFFER
      if (fish.vy < 0) {
        fish.vy = -fish.vy * restitution
      }
    }

    // Bottom water boundary collision
    if (fish.y + fish.radius >= this.waterBottom - COLLISION_BOUNDARY_BUFFER) {
      fish.y = this.waterBottom - fish.radius - COLLISION_BOUNDARY_BUFFER
      if (fish.vy > 0) {
        fish.vy = -fish.vy * restitution
      }
    }
  }

  getSpawnBounds(): ISpawnBounds {
    const safeMargin = 20

    return {
      minX: this.marginX + safeMargin,
      maxX: this.width - this.marginX - safeMargin,
      minY: this.waterTop + safeMargin,
      maxY: this.waterBottom - safeMargin,
    }
  }
}
