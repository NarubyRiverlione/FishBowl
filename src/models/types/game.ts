// Game state types for the FishBowl game
import { ITankLogic } from './tank'
import { IStoreItem } from './storeItem'

export type UUID = string
export type Timestamp = number
export type Credits = number

export interface IGameState {
  currentTick: number
  totalTime: number
  isPaused: boolean
  maturityBonusAwarded: boolean
  tutorialEnabled: boolean
  tutorialEvents: string[]
  tanks: ITankLogic[]
  credits: Credits
  storeInventory: IStoreItem[]
  selectedFishId: UUID | null
  gameStartedAt: Timestamp
}
