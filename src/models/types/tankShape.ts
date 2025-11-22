// Tank shape abstraction for handling both circular and rectangular collision detection

import { IFish } from './index'

export interface ISpawnBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export interface ITankShape {
  // Shape identifier
  type: 'circular' | 'rectangular'

  // Geometry
  centerX: number
  centerY: number
  width: number
  height: number
  radius?: number

  // Boundary checking
  checkBoundary(fish: IFish): boolean
  resolveBoundary(fish: IFish): void
  getSpawnBounds(): ISpawnBounds
}
