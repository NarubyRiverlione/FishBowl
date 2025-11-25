import { IFishLogic } from '../../../models/types/index'
import { ITankShape, ISpawnBounds, ISurfaceCollider } from '../../../models/types/tankShape'
import {
  COLLISION_BOUNDARY_BUFFER,
  WATER_SURFACE_RATIO_BOWL,
  FLOOR_RESTITUTION,
  WALL_RESTITUTION,
} from '../../../lib/constants'

// SVG viewBox is 0-100, tank game world is 0-300 (scale factor: 3.0)
const SVG_SCALE = 3.0

/**
 * Arc segment collision detection for bowl's curved walls
 * Left arc: SVG (15, 25) → (29.7, 90), radius 43.75
 * Right arc: SVG (85, 25) → (70.3, 90), radius 43.75
 */
class ArcSurfaceCollider implements ISurfaceCollider {
  readonly type = 'wall'
  readonly restitution = WALL_RESTITUTION

  private arcCenterX: number
  private arcCenterY: number
  private arcRadius: number
  private startAngle: number
  private endAngle: number
  private isLeftArc: boolean

  constructor(
    arcCenterX: number,
    arcCenterY: number,
    arcRadius: number,
    startAngle: number,
    endAngle: number,
    isLeftArc: boolean
  ) {
    this.arcCenterX = arcCenterX
    this.arcCenterY = arcCenterY
    this.arcRadius = arcRadius
    this.startAngle = startAngle
    this.endAngle = endAngle
    this.isLeftArc = isLeftArc
  }

  checkCollision(fish: IFishLogic): boolean {
    // Strict x-coordinate rejection based on arc endpoints
    // Left arc spans x: 45 to 89 (plus collision buffer)
    // Right arc spans x: 211 to 255 (plus collision buffer)
    const leftArcMaxX = 89 + COLLISION_BOUNDARY_BUFFER + 15 // Add margin for fish radius
    const rightArcMinX = 211 - COLLISION_BOUNDARY_BUFFER - 15

    if (this.isLeftArc && fish.x > leftArcMaxX) return false
    if (!this.isLeftArc && fish.x < rightArcMinX) return false

    const { distance } = this.getClosestPointOnArc(fish.x, fish.y)

    // Only report collision if fish is actually penetrating the arc (distance is small)
    // This avoids false positives for fish far from the arc
    return distance < fish.radius + COLLISION_BOUNDARY_BUFFER
  }

  resolveCollision(fish: IFishLogic): void {
    const { closestX, closestY, distance } = this.getClosestPointOnArc(fish.x, fish.y)

    if (distance < fish.radius + COLLISION_BOUNDARY_BUFFER) {
      // Calculate normal vector from arc surface to fish center
      const dx = fish.x - closestX
      const dy = fish.y - closestY
      const len = Math.sqrt(dx * dx + dy * dy)

      if (len > 0) {
        const nx = dx / len
        const ny = dy / len

        // Push fish away from arc to valid position
        const targetDist = fish.radius + COLLISION_BOUNDARY_BUFFER
        fish.x = closestX + nx * targetDist
        fish.y = closestY + ny * targetDist

        // Reflect velocity with restitution
        const dotProduct = fish.vx * nx + fish.vy * ny
        if (dotProduct < 0) {
          // Fish moving into surface
          fish.vx = fish.vx - 2 * dotProduct * nx * this.restitution
          fish.vy = fish.vy - 2 * dotProduct * ny * this.restitution
        }
      } else {
        // Fish exactly on arc point (rare edge case)
        fish.x += fish.radius + COLLISION_BOUNDARY_BUFFER
      }
    }
  }

  /**
   * Find closest point on arc segment to given position
   * Returns closest point and distance from fish to that point
   */
  private getClosestPointOnArc(fishX: number, fishY: number): { closestX: number; closestY: number; distance: number } {
    // Vector from arc center to fish
    const dx = fishX - this.arcCenterX
    const dy = fishY - this.arcCenterY
    const distFromCenter = Math.sqrt(dx * dx + dy * dy)

    if (distFromCenter === 0) {
      // Fish at arc center (should never happen, but handle gracefully)
      return {
        closestX: this.arcCenterX + this.arcRadius,
        closestY: this.arcCenterY,
        distance: this.arcRadius,
      }
    }

    // Project fish onto arc circle
    const angle = Math.atan2(dy, dx)

    // Clamp angle to arc segment range
    let clampedAngle = angle
    if (this.startAngle < this.endAngle) {
      // Normal case
      if (angle < this.startAngle) clampedAngle = this.startAngle
      if (angle > this.endAngle) clampedAngle = this.endAngle
    } else {
      // Arc crosses 0/2π boundary
      if (angle < this.startAngle && angle > this.endAngle) {
        clampedAngle =
          Math.abs(angle - this.startAngle) < Math.abs(angle - this.endAngle) ? this.startAngle : this.endAngle
      }
    }

    // Closest point on arc
    const closestX = this.arcCenterX + Math.cos(clampedAngle) * this.arcRadius
    const closestY = this.arcCenterY + Math.sin(clampedAngle) * this.arcRadius

    // Distance from fish to closest point
    const distX = fishX - closestX
    const distY = fishY - closestY
    const distance = Math.sqrt(distX * distX + distY * distY)

    return { closestX, closestY, distance }
  }
}

/**
 * Constrained floor collider for bowl's narrow flat bottom
 * Floor only exists between x=89px and x=211px (SVG 29.7-70.3 scaled)
 * Fish outside this x-range fall through to arc collision
 */
class ConstrainedFloorSurfaceCollider implements ISurfaceCollider {
  readonly type = 'floor'
  readonly restitution = FLOOR_RESTITUTION
  private floorY: number
  private floorLeftX: number
  private floorRightX: number

  constructor(floorY: number, floorLeftX: number, floorRightX: number) {
    this.floorY = floorY
    this.floorLeftX = floorLeftX
    this.floorRightX = floorRightX
  }

  checkCollision(fish: IFishLogic): boolean {
    return (
      fish.y + fish.radius > this.floorY - COLLISION_BOUNDARY_BUFFER &&
      fish.x >= this.floorLeftX &&
      fish.x <= this.floorRightX
    )
  }

  resolveCollision(fish: IFishLogic): void {
    if (
      fish.y + fish.radius > this.floorY - COLLISION_BOUNDARY_BUFFER &&
      fish.x >= this.floorLeftX &&
      fish.x <= this.floorRightX
    ) {
      // Position fish exactly on floor (no buffer gap)
      fish.y = this.floorY - fish.radius

      // Apply floor restitution: gentle bounce
      if (fish.vy > 0) {
        fish.vy = -fish.vy * this.restitution
      }
    }
  }
}

/**
 * Surface collider for water surface (top boundary)
 * Prevents fish from leaving water at the surface
 * Unchanged from original implementation
 */
class WaterSurfaceCollider implements ISurfaceCollider {
  readonly type = 'water_surface'
  readonly restitution = WALL_RESTITUTION // Water surface acts like a wall
  private waterSurfaceY: number

  constructor(waterSurfaceY: number) {
    this.waterSurfaceY = waterSurfaceY
  }

  checkCollision(fish: IFishLogic): boolean {
    return fish.y - fish.radius < this.waterSurfaceY + COLLISION_BOUNDARY_BUFFER
  }

  resolveCollision(fish: IFishLogic): void {
    if (fish.y - fish.radius < this.waterSurfaceY + COLLISION_BOUNDARY_BUFFER) {
      fish.y = this.waterSurfaceY + fish.radius + COLLISION_BOUNDARY_BUFFER

      // Reflect off water surface
      if (fish.vy < 0) {
        fish.vy = -fish.vy * this.restitution
      }
    }
  }
}

/**
 * BowlTankShape represents a fish bowl with accurate curved walls matching the SVG visual
 * Composite of four surfaces:
 * 1. Left curved arc (bulging sidewall) with high restitution (0.8) for bouncing
 * 2. Right curved arc (bulging sidewall) with high restitution (0.8) for bouncing
 * 3. Constrained flat floor at bottom (x: 89-211px) with low restitution (0.2) for gentle settling
 * 4. Water surface at top as a hard ceiling with wall restitution (0.8)
 *
 * SVG geometry (viewBox 0-100, scaled 3x to 300x300 game world):
 * - Left arc: (15, 25) → (29.7, 90), radius 43.75
 * - Right arc: (85, 25) → (70.3, 90), radius 43.75
 * - Floor: y=90 (270px), x: 29.7-70.3 (89-211px)
 * - Water surface: 10% from top (y=30px/75 SVG)
 */
export class BowlTankShape implements ITankShape {
  readonly type = 'bowl'
  surfaces: ISurfaceCollider[]
  private centerX: number
  private centerY: number
  private width: number
  private height: number

  constructor(centerX: number, centerY: number, width: number, height: number) {
    this.centerX = centerX
    this.centerY = centerY
    this.width = width
    this.height = height

    // SVG coordinates (viewBox 0-100) → Game coordinates (0-300)
    // Left arc: from (15, 25) to (29.7, 90), radius 43.75
    // Right arc: from (85, 25) to (70.3, 90), radius 43.75
    const leftArcStart = { x: 15 * SVG_SCALE, y: 25 * SVG_SCALE }
    const leftArcEnd = { x: 29.7 * SVG_SCALE, y: 90 * SVG_SCALE }
    const rightArcStart = { x: 85 * SVG_SCALE, y: 25 * SVG_SCALE }
    const rightArcEnd = { x: 70.3 * SVG_SCALE, y: 90 * SVG_SCALE }
    const arcRadius = 43.75 * SVG_SCALE

    // Calculate arc centers using arc geometry
    // For left arc: center is to the left of the arc
    const leftCenter = this.calculateArcCenter(leftArcStart, leftArcEnd, arcRadius, 'left')
    // For right arc: center is to the right of the arc
    const rightCenter = this.calculateArcCenter(rightArcStart, rightArcEnd, arcRadius, 'right')

    // Calculate angular ranges for arc segments
    const leftStartAngle = Math.atan2(leftArcStart.y - leftCenter.y, leftArcStart.x - leftCenter.x)
    const leftEndAngle = Math.atan2(leftArcEnd.y - leftCenter.y, leftArcEnd.x - leftCenter.x)
    const rightStartAngle = Math.atan2(rightArcStart.y - rightCenter.y, rightArcStart.x - rightCenter.x)
    const rightEndAngle = Math.atan2(rightArcEnd.y - rightCenter.y, rightArcEnd.x - rightCenter.x)

    // Floor and water surface
    // Bowl SVG has floor at y=90 (out of 0-100 viewBox), leaving 10 units of gap at bottom
    // This gap (30px scaled) is intentional visual design - collision floor matches visual floor
    const floorY = 90 * SVG_SCALE // SVG floor position at y=270 for 300px bowl
    const floorLeftX = 29.7 * SVG_SCALE // Left edge of narrow floor (x=89)
    const floorRightX = 70.3 * SVG_SCALE // Right edge of narrow floor (x=211)
    const waterSurfaceY = centerY - height / 2 + height * (1 - WATER_SURFACE_RATIO_BOWL)

    this.surfaces = [
      new ArcSurfaceCollider(leftCenter.x, leftCenter.y, arcRadius, leftStartAngle, leftEndAngle, true),
      new ArcSurfaceCollider(rightCenter.x, rightCenter.y, arcRadius, rightStartAngle, rightEndAngle, false),
      new ConstrainedFloorSurfaceCollider(floorY, floorLeftX, floorRightX),
      new WaterSurfaceCollider(waterSurfaceY),
    ]
  }

  /**
   * Calculate arc center given two endpoints and radius
   * Side parameter determines which of the two possible centers to use
   */
  private calculateArcCenter(
    start: { x: number; y: number },
    end: { x: number; y: number },
    radius: number,
    side: 'left' | 'right'
  ): { x: number; y: number } {
    // Midpoint between start and end
    const midX = (start.x + end.x) / 2
    const midY = (start.y + end.y) / 2

    // Distance between start and end
    const dx = end.x - start.x
    const dy = end.y - start.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    // Distance from midpoint to center
    const h = Math.sqrt(radius * radius - (dist / 2) * (dist / 2))

    // Perpendicular vector (rotated 90 degrees)
    const perpX = -dy / dist
    const perpY = dx / dist

    // Two possible centers (left and right of the chord)
    const centerMultiplier = side === 'left' ? -1 : 1

    return {
      x: midX + perpX * h * centerMultiplier,
      y: midY + perpY * h * centerMultiplier,
    }
  }

  checkBoundary(fish: IFishLogic): boolean {
    // Bowl extent: Calculate based on actual tank dimensions
    // SVG viewBox is 0-100, left rim at 15, right rim at 85
    const svgScale = this.width / 100
    const bowlLeftExtent = 15 * svgScale
    const bowlRightExtent = 85 * svgScale

    // First check if fish is completely outside bowl's actual extent
    if (
      fish.x - fish.radius < bowlLeftExtent ||
      fish.x + fish.radius > bowlRightExtent ||
      fish.y - fish.radius < 0 ||
      fish.y + fish.radius > this.height
    ) {
      return true // Out of bowl bounds
    }

    // Then check surface collisions (arcs, floor, water surface)
    return this.surfaces.some((surface) => surface.checkCollision(fish))
  }

  resolveBoundary(fish: IFishLogic): void {
    // Bowl extent: Calculate based on actual tank dimensions
    // SVG viewBox is 0-100, left rim at 15, right rim at 85
    const svgScale = this.width / 100
    const bowlLeftExtent = 15 * svgScale
    const bowlRightExtent = 85 * svgScale

    // First resolve boundary violations (fish outside bowl's actual extent)
    if (fish.x - fish.radius < bowlLeftExtent) {
      fish.x = bowlLeftExtent + fish.radius + COLLISION_BOUNDARY_BUFFER
      fish.vx = Math.abs(fish.vx) * WALL_RESTITUTION
    }
    if (fish.x + fish.radius > bowlRightExtent) {
      fish.x = bowlRightExtent - fish.radius - COLLISION_BOUNDARY_BUFFER
      fish.vx = -Math.abs(fish.vx) * WALL_RESTITUTION
    }
    if (fish.y - fish.radius < 0) {
      fish.y = fish.radius + COLLISION_BOUNDARY_BUFFER
      fish.vy = Math.abs(fish.vy) * WALL_RESTITUTION
    }
    if (fish.y + fish.radius > this.height) {
      fish.y = this.height - fish.radius - COLLISION_BOUNDARY_BUFFER
      fish.vy = -Math.abs(fish.vy) * WALL_RESTITUTION
    }

    // Then resolve surface collisions (arcs, floor, water surface)
    // Track which surfaces have been hit to prevent double-collisions
    const hitSurfaces = new Set<ISurfaceCollider>()

    for (const surface of this.surfaces) {
      if (surface.checkCollision(fish) && !hitSurfaces.has(surface)) {
        surface.resolveCollision(fish)
        hitSurfaces.add(surface)
      }
    }
  }

  getSpawnBounds(): ISpawnBounds {
    // Spawn within safe area: above floor, below water, horizontally centered
    const safeMargin = 30
    const floorY = 90 * SVG_SCALE // Match SVG floor position, not tank bottom
    const waterSurfaceY = this.centerY - this.height / 2 + this.height * (1 - WATER_SURFACE_RATIO_BOWL)

    // Horizontal bounds: use narrower region to avoid spawning near curved walls
    const spawnWidth = 100 * SVG_SCALE // Approx 1/3 of tank width, centered
    const spawnMinX = this.centerX - spawnWidth / 2
    const spawnMaxX = this.centerX + spawnWidth / 2

    return {
      minX: spawnMinX,
      maxX: spawnMaxX,
      minY: waterSurfaceY + safeMargin,
      maxY: floorY - safeMargin,
    }
  }
}
