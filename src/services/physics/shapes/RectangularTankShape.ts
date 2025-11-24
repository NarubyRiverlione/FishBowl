import { IFishLogic, ITankGeometry } from '../../../models/types/index'
import { ITankShape, ISpawnBounds } from '../../../models/types/tankShape'
import { COLLISION_BOUNDARY_BUFFER, WATER_SURFACE_RATIO } from '../../../lib/constants'

export class RectangularTankShape implements ITankShape {
  readonly type = 'rectangular'
  geometry: ITankGeometry

  constructor(centerX: number, centerY: number, width: number, height: number) {
    this.geometry = { centerX, centerY, width, height }
  }

  checkBoundary(fish: IFishLogic): boolean {
    const left = this.geometry.centerX - this.geometry.width / 2
    const right = this.geometry.centerX + this.geometry.width / 2
    const top = this.geometry.centerY - this.geometry.height / 2
    const waterBottom = this.geometry.centerY + (this.geometry.height / 2) * WATER_SURFACE_RATIO

    return (
      fish.x - fish.radius > left + COLLISION_BOUNDARY_BUFFER &&
      fish.x + fish.radius < right - COLLISION_BOUNDARY_BUFFER &&
      fish.y - fish.radius > top + COLLISION_BOUNDARY_BUFFER &&
      fish.y + fish.radius < waterBottom - COLLISION_BOUNDARY_BUFFER
    )
  }

  resolveBoundary(fish: IFishLogic): void {
    const left = this.geometry.centerX - this.geometry.width / 2
    const right = this.geometry.centerX + this.geometry.width / 2
    const top = this.geometry.centerY - this.geometry.height / 2
    const waterBottom = this.geometry.centerY + (this.geometry.height / 2) * WATER_SURFACE_RATIO

    // Left wall
    if (fish.x - fish.radius < left + COLLISION_BOUNDARY_BUFFER) {
      fish.x = left + fish.radius + COLLISION_BOUNDARY_BUFFER
      fish.vx = Math.max(0, fish.vx) // Force away from wall
    }

    // Right wall
    if (fish.x + fish.radius > right - COLLISION_BOUNDARY_BUFFER) {
      fish.x = right - fish.radius - COLLISION_BOUNDARY_BUFFER
      fish.vx = Math.min(0, fish.vx) // Force away from wall
    }

    // Top wall
    if (fish.y - fish.radius < top + COLLISION_BOUNDARY_BUFFER) {
      fish.y = top + fish.radius + COLLISION_BOUNDARY_BUFFER
      fish.vy = Math.max(0, fish.vy) // Force away from wall
    }

    // Water surface (bottom boundary)
    if (fish.y + fish.radius > waterBottom - COLLISION_BOUNDARY_BUFFER) {
      fish.y = waterBottom - fish.radius - COLLISION_BOUNDARY_BUFFER
      fish.vy = Math.min(0, fish.vy) // Force away from surface
    }
  }

  getSpawnBounds(): ISpawnBounds {
    const left = this.geometry.centerX - this.geometry.width / 2
    const right = this.geometry.centerX + this.geometry.width / 2
    const top = this.geometry.centerY - this.geometry.height / 2
    const waterBottom = this.geometry.centerY + (this.geometry.height / 2) * WATER_SURFACE_RATIO
    const padding = 20

    return {
      minX: left + padding,
      maxX: right - padding,
      minY: top + padding,
      maxY: waterBottom - padding,
    }
  }
}
