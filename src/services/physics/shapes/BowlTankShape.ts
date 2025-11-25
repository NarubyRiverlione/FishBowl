import { IFishLogic } from '../../../models/types/index'
import { ITankShape, ISpawnBounds, ISurfaceCollider } from '../../../models/types/tankShape'
import {
  COLLISION_BOUNDARY_BUFFER,
  WATER_SURFACE_RATIO,
  FLOOR_RESTITUTION,
  WALL_RESTITUTION,
} from '../../../lib/constants'

/**
 * Surface collider for circular wall (curved side of the bowl)
 * Uses circular collision detection with wall restitution (0.8)
 */
class WallSurfaceCollider implements ISurfaceCollider {
  readonly type = 'wall'
  readonly restitution = WALL_RESTITUTION
  private centerX: number
  private centerY: number
  private radius: number

  constructor(centerX: number, centerY: number, radius: number) {
    this.centerX = centerX
    this.centerY = centerY
    this.radius = radius
  }

  checkCollision(fish: IFishLogic): boolean {
    const dx = fish.x - this.centerX
    const dy = fish.y - this.centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance + fish.radius > this.radius - COLLISION_BOUNDARY_BUFFER
  }

  resolveCollision(fish: IFishLogic): void {
    const dx = fish.x - this.centerX
    const dy = fish.y - this.centerY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance + fish.radius > this.radius - COLLISION_BOUNDARY_BUFFER) {
      if (distance > 0) {
        const nx = dx / distance
        const ny = dy / distance

        // Push fish away from wall
        const overlap = distance + fish.radius - (this.radius - COLLISION_BOUNDARY_BUFFER)
        fish.x -= nx * overlap
        fish.y -= ny * overlap

        // Reflect velocity with restitution
        const dotProduct = fish.vx * nx + fish.vy * ny
        if (dotProduct > 0) {
          fish.vx = (fish.vx - 2 * dotProduct * nx) * this.restitution
          fish.vy = (fish.vy - 2 * dotProduct * ny) * this.restitution
        }
      } else {
        // Fish at exact center, move away arbitrarily
        fish.x += fish.radius + COLLISION_BOUNDARY_BUFFER
      }
    }
  }
}

/**
 * Surface collider for floor (flat bottom of the bowl)
 * Uses simple horizontal line collision at tank bottom
 * Applies floor restitution (0.2) for gentle settling
 */
class FloorSurfaceCollider implements ISurfaceCollider {
  readonly type = 'floor'
  readonly restitution = FLOOR_RESTITUTION
  private floorY: number

  constructor(floorY: number) {
    this.floorY = floorY
  }

  checkCollision(fish: IFishLogic): boolean {
    return fish.y + fish.radius > this.floorY - COLLISION_BOUNDARY_BUFFER
  }

  resolveCollision(fish: IFishLogic): void {
    if (fish.y + fish.radius > this.floorY - COLLISION_BOUNDARY_BUFFER) {
      fish.y = this.floorY - fish.radius - COLLISION_BOUNDARY_BUFFER

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
 * BowlTankShape represents a fish bowl as a composite of three surfaces:
 * 1. Curved sidewall (circular) with high restitution (0.8) for bouncing
 * 2. Flat floor at bottom with low restitution (0.2) for gentle settling
 * 3. Water surface at top as a hard ceiling with wall restitution (0.8)
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

    const radius = Math.min(width, height) / 2
    const floorY = centerY + height / 2 // Bottom of bowl
    // Water fills WATER_SURFACE_RATIO (90%) from bottom, so surface is at top 10% from top
    const waterSurfaceY = centerY - height / 2 + height * (1 - WATER_SURFACE_RATIO)

    this.surfaces = [
      new WallSurfaceCollider(centerX, centerY, radius),
      new FloorSurfaceCollider(floorY),
      new WaterSurfaceCollider(waterSurfaceY),
    ]
  }

  private get radius(): number {
    return Math.min(this.width, this.height) / 2
  }

  checkBoundary(fish: IFishLogic): boolean {
    // Returns true if collision detected (fish out of bounds), false if within bounds
    return this.surfaces.some((surface) => surface.checkCollision(fish))
  }

  resolveBoundary(fish: IFishLogic): void {
    // Resolve all surface collisions for this fish
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
    // Spawn within bowl, above the floor, and below water line
    const safeMargin = 30
    const insetRadius = this.radius - safeMargin
    const floorY = this.centerY + this.height / 2
    const waterSurfaceY = this.centerY + (this.height / 2) * (1 - WATER_SURFACE_RATIO)

    return {
      minX: this.centerX - insetRadius,
      maxX: this.centerX + insetRadius,
      minY: waterSurfaceY + safeMargin,
      maxY: floorY - safeMargin,
    }
  }
}
