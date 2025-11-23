// Tank-related types for the FishBowl game
import { IFishData, IFishLogic } from './fish'

export type UUID = string
export type Timestamp = number
export type TankSize = 'BOWL' | 'STANDARD' | 'BIG'

/**
 * Tank geometry - single source of truth for dimensions and positioning
 */
export interface ITankGeometry {
  width: number
  height: number
  centerX: number
  centerY: number
}

/**
 * Tank data interface for store (data only, no methods)
 * This is what gets stored in Zustand - pure serializable data
 */
export interface ITankData {
  id: UUID
  size: TankSize
  capacity: number
  createdAt: Timestamp

  // Geometry (single source of truth)
  geometry: ITankGeometry

  // Water and environment
  waterQuality: number // 0-100
  pollution: number // 0-100
  hasFilter: boolean
  temperature: number // 0-40

  // Visual properties
  backgroundColor: number

  // Fish population (data only)
  fish: IFishData[]
}

/**
 * Tank behavioral interface - extends data with methods
 * The Zustand store uses ITankData because it is pure data and cannot have methods.
 * This is used by game logic services that need tank behavior
 */
export interface ITankLogic extends ITankData {
  // Performance metrics (for monitoring)
  collisionChecks: number
  collisionsResolved: number

  // Behavioral methods
  addFish(fish: IFishLogic): void
  removeFish(fishId: string): void
  update(delta: number): void

  // Collision detection methods
  checkBoundary(fish: IFishLogic): boolean
  resolveBoundary(fish: IFishLogic): void
  getSpawnBounds(): import('./tankShape').ISpawnBounds
}
