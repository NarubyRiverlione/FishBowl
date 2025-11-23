// Tank shape abstraction for handling both circular and rectangular collision detection

import { IFish } from './fish'
import { ITankGeometry } from './tank'

export interface ISpawnBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

/**
 * Tank shape behavior - no longer duplicates geometry data
 * Uses composition pattern with ITankGeometry
 */
export interface ITankShape {
  // Shape identifier
  type: 'circular' | 'rectangular'

  // Boundary checking methods that accept geometry
  checkBoundary(fish: IFish, geometry: ITankGeometry): boolean
  resolveBoundary(fish: IFish, geometry: ITankGeometry): void
  getSpawnBounds(geometry: ITankGeometry): ISpawnBounds
}
