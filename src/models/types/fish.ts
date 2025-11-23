// Fish-related types for the FishBowl game
export type UUID = string
export type Timestamp = number

export enum FishSpecies {
  GUPPY = 'GUPPY',
  GOLDFISH = 'GOLDFISH',
  TETRA = 'TETRA',
  BETTA = 'BETTA',
}

/**
 * Fish geometry - single source of truth for position and physics properties
 */
export interface IFishGeometry {
  position: { x: number; y: number }
  velocity: { vx: number; vy: number }
  radius: number
}

/**
 * Enhanced fish data interface for store (data only, no methods)
 * Uses geometry composition pattern
 */
export interface IFishData {
  id: UUID
  species: FishSpecies
  name?: string
  color: string
  size: number // 0.5-2.0
  age: number
  health: number // 0-100
  hunger: number // 0-100
  isAlive: boolean
  genetics: Record<string, unknown>
  createdAt: Timestamp
  lastFedAt?: Timestamp

  // Geometry (single source of truth for position/physics)
  geometry: IFishGeometry
}

/**
 * Enhanced fish behavioral interface for future use
 * Uses geometry composition pattern - to be implemented gradually
 */
export interface IFishLogic extends IFishData {
  // Backward compatibility properties (getters/setters access geometry)
  x: number
  y: number
  vx: number
  vy: number
  radius: number

  // Behavioral methods
  update(delta: number): void
  getEffectiveRadius(): number
  swim(): void
}

export interface IFishSpeciesConfig {
  baseValue: number
  sizeRange: [number, number]
  health: number
  hungerRate: number
}
