// Tank shape abstraction for handling both circular and rectangular collision detection

import { IFishLogic } from './fish'

export interface ISpawnBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

/**
 * Surface collider for composite shape collision detection
 * Represents individual collision surfaces (wall, floor, water surface)
 * Each surface has its own collision boundaries and restitution value
 */
export interface ISurfaceCollider {
  // Surface type identifier
  type: 'wall' | 'floor' | 'water_surface'

  // Restitution value: 0.0 = no bounce, 1.0 = perfect bounce
  // Typical values: 0.2 (floor - gentle), 0.8 (walls - bouncy)
  restitution: number

  // Check if fish collides with this surface
  checkCollision(fish: IFishLogic): boolean

  // Resolve collision with restitution applied
  resolveCollision(fish: IFishLogic): void
}

/**
 * Tank shape behavior - collision detection abstraction
 * Shapes are created with dimensions passed to constructor.
 * Geometry is NOT stored here - Tank model holds single source of truth from store.
 * Supports both single-surface (legacy) and multi-surface shapes.
 */
export interface ITankShape {
  // Shape identifier
  type: 'circular' | 'rectangular' | 'bowl'

  // Legacy single-surface boundary methods (for backward compatibility)
  checkBoundary(fish: IFishLogic): boolean
  resolveBoundary(fish: IFishLogic): void
  getSpawnBounds(): ISpawnBounds

  // Multi-surface collision detection (optional for legacy shapes)
  surfaces?: ISurfaceCollider[]
}
