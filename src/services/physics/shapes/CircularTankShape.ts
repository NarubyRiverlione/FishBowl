import { IFishLogic, ITankGeometry } from '../../../models/types/index'
import { ITankShape, ISpawnBounds } from '../../../models/types/tankShape'
import { COLLISION_BOUNDARY_BUFFER, WATER_SURFACE_RATIO } from '../../../lib/constants'

export class CircularTankShape implements ITankShape {
  readonly type = 'circular'
  geometry: ITankGeometry

  constructor(centerX: number, centerY: number, radius: number) {
    this.geometry = { centerX, centerY, width: radius * 2, height: radius * 2 }
  }

  get radius(): number {
    return this.geometry.width / 2
  }

  checkBoundary(fish: IFishLogic): boolean {
    // Calculate water surface (95% of tank height from center)
    const waterSurfaceY = this.geometry.centerY + (this.geometry.height / 2) * WATER_SURFACE_RATIO

    // Fish must not breach water surface
    if (fish.y - fish.radius < this.geometry.centerY - this.geometry.height / 2 + COLLISION_BOUNDARY_BUFFER) {
      return false
    }
    if (fish.y + fish.radius > waterSurfaceY - COLLISION_BOUNDARY_BUFFER) {
      return false
    }

    // Check circular boundary (horizontal)
    const dx = fish.x - this.geometry.centerX
    const dy = fish.y - this.geometry.centerY
    const radius = this.geometry.width / 2
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance + fish.radius <= radius - COLLISION_BOUNDARY_BUFFER
  }

  resolveBoundary(fish: IFishLogic): void {
    // Water surface collision (top)
    const waterSurfaceY = this.geometry.centerY + (this.geometry.height / 2) * WATER_SURFACE_RATIO
    if (fish.y - fish.radius < this.geometry.centerY - this.geometry.height / 2 + COLLISION_BOUNDARY_BUFFER) {
      fish.y = this.geometry.centerY - this.geometry.height / 2 + fish.radius + COLLISION_BOUNDARY_BUFFER
      fish.vy = Math.max(0, fish.vy)
    }

    // Water surface collision (bottom)
    if (fish.y + fish.radius > waterSurfaceY - COLLISION_BOUNDARY_BUFFER) {
      fish.y = waterSurfaceY - fish.radius - COLLISION_BOUNDARY_BUFFER
      fish.vy = Math.min(0, fish.vy)
    }

    // Circular wall collision
    const dx = fish.x - this.geometry.centerX
    const dy = fish.y - this.geometry.centerY
    const radius = this.geometry.width / 2
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance + fish.radius > radius - COLLISION_BOUNDARY_BUFFER) {
      // Calculate normal vector from circle center to fish
      if (distance > 0) {
        const nx = dx / distance
        const ny = dy / distance

        // Push fish away from wall
        const overlap = distance + fish.radius - (radius - COLLISION_BOUNDARY_BUFFER)
        fish.x -= nx * overlap
        fish.y -= ny * overlap

        // Reflect velocity away from wall
        const dotProduct = fish.vx * nx + fish.vy * ny
        if (dotProduct > 0) {
          fish.vx -= 2 * dotProduct * nx
          fish.vy -= 2 * dotProduct * ny
        }
      } else {
        // Fish at exact center, move away arbitrarily
        fish.x += fish.radius + COLLISION_BOUNDARY_BUFFER
      }
    }
  }

  getSpawnBounds(): ISpawnBounds {
    // Circular spawn bounds - inscribed square with padding
    const insetRadius = this.geometry.width / 2 - 40
    return {
      minX: this.geometry.centerX - insetRadius,
      maxX: this.geometry.centerX + insetRadius,
      minY: this.geometry.centerY - insetRadius + 20,
      maxY: this.geometry.centerY + (this.geometry.height / 2) * WATER_SURFACE_RATIO - 40,
    }
  }
}
