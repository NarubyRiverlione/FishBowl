import { IFishLogic } from '../../../models/types/index'
import { ITankShape, ISpawnBounds, ISurfaceCollider } from '../../../models/types/tankShape'
import { COLLISION_BOUNDARY_BUFFER, WATER_SURFACE_RATIO, WALL_RESTITUTION } from '../../../lib/constants'

/**
 * Surface collider for circular wall (for pure circular tanks without floor)
 */
class CircularWallSurfaceCollider implements ISurfaceCollider {
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
        fish.x += fish.radius + COLLISION_BOUNDARY_BUFFER
      }
    }
  }
}

/**
 * Surface collider for water surface (ceiling)
 */
class CircularWaterSurfaceCollider implements ISurfaceCollider {
  readonly type = 'water_surface'
  readonly restitution = WALL_RESTITUTION
  private waterSurfaceY: number
  private topBoundaryY: number

  constructor(centerY: number, height: number) {
    // Water fills WATER_SURFACE_RATIO (90%) from bottom, so surface is at top 10% from top
    this.waterSurfaceY = centerY - height / 2 + height * (1 - WATER_SURFACE_RATIO)
    this.topBoundaryY = centerY - height / 2
  }

  checkCollision(fish: IFishLogic): boolean {
    // Collision if fish goes above tank top OR above water surface
    return (
      fish.y - fish.radius < this.topBoundaryY + COLLISION_BOUNDARY_BUFFER ||
      fish.y - fish.radius < this.waterSurfaceY + COLLISION_BOUNDARY_BUFFER
    )
  }

  resolveCollision(fish: IFishLogic): void {
    // Top boundary (hard ceiling)
    if (fish.y - fish.radius < this.topBoundaryY + COLLISION_BOUNDARY_BUFFER) {
      fish.y = this.topBoundaryY + fish.radius + COLLISION_BOUNDARY_BUFFER
      if (fish.vy < 0) {
        fish.vy = -fish.vy * this.restitution
      }
    }

    // Water surface (bottom)
    if (fish.y + fish.radius > this.waterSurfaceY - COLLISION_BOUNDARY_BUFFER) {
      fish.y = this.waterSurfaceY - fish.radius - COLLISION_BOUNDARY_BUFFER
      if (fish.vy > 0) {
        fish.vy = -fish.vy * this.restitution
      }
    }
  }
}

export class CircularTankShape implements ITankShape {
  readonly type = 'circular'
  surfaces: ISurfaceCollider[]
  private centerX: number
  private centerY: number
  private _radius: number

  constructor(centerX: number, centerY: number, radius: number) {
    this.centerX = centerX
    this.centerY = centerY
    this._radius = radius

    // Initialize surfaces for multi-surface collision support
    this.surfaces = [
      new CircularWallSurfaceCollider(centerX, centerY, radius),
      new CircularWaterSurfaceCollider(centerY, radius * 2),
    ]
  }

  // Public getter for radius (used by tests and spawn bounds calculation)
  get radius(): number {
    return this._radius
  }

  checkBoundary(fish: IFishLogic): boolean {
    // Legacy method: returns true if collision detected (fish out of bounds), false if within bounds
    return this.surfaces.some((surface) => surface.checkCollision(fish))
  }

  resolveBoundary(fish: IFishLogic): void {
    // Legacy method: resolve collisions using surface colliders
    const hitSurfaces = new Set<ISurfaceCollider>()

    for (const surface of this.surfaces) {
      if (surface.checkCollision(fish) && !hitSurfaces.has(surface)) {
        surface.resolveCollision(fish)
        hitSurfaces.add(surface)
      }
    }
  }

  getSpawnBounds(): ISpawnBounds {
    // Circular spawn bounds - inscribed square with padding
    const insetRadius = this.radius - 40
    const waterSurfaceY = this.centerY + this.radius * WATER_SURFACE_RATIO
    return {
      minX: this.centerX - insetRadius,
      maxX: this.centerX + insetRadius,
      minY: this.centerY - insetRadius + 20,
      maxY: waterSurfaceY - 40,
    }
  }
}
