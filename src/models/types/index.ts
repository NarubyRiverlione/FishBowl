// Domain types for the FishBowl game (canonical source)
export type UUID = string
export type Timestamp = number // milliseconds
export type Credits = number

export enum FishSpecies {
  GUPPY = 'GUPPY',
  GOLDFISH = 'GOLDFISH',
  TETRA = 'TETRA',
  BETTA = 'BETTA',
}

export type TankSize = 'BOWL' | 'STANDARD' | 'BIG'

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
}

export interface ITank {
  id: UUID
  size: TankSize
  capacity: number
  waterQuality: number // 0-100
  pollution: number // 0-100
  hasFilter: boolean
  temperature: number // 0-40
  fish: IFish[]
  createdAt: Timestamp
}

export interface IStoreItem {
  id: string
  type: 'FISH' | 'FOOD' | 'EQUIPMENT' | 'UPGRADE'
  name: string
  description?: string
  cost: number
  quantity: number // -1 = unlimited
  species?: FishSpecies
}

export interface IGameState {
  currentTick: number
  totalTime: number
  isPaused: boolean
  maturityBonusAwarded: boolean
  tutorialEnabled: boolean
  tutorialEvents: string[]
  tanks: ITank[]
  credits: Credits
  storeInventory: IStoreItem[]
  selectedFishId?: UUID | null
  gameStartedAt?: Timestamp
}
