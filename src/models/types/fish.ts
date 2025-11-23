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
 * Complete fish interface with all game properties
 */
export interface IFish {
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
  // Physics properties
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  getEffectiveRadius?: () => number
}

export interface IFishSpeciesConfig {
  baseValue: number
  sizeRange: [number, number]
  health: number
  hungerRate: number
}
