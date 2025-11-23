// Store-related types for the FishBowl game
import { FishSpecies } from './fish'

export interface IStoreItem {
  id: string
  type: 'FISH' | 'FOOD' | 'EQUIPMENT' | 'UPGRADE'
  name: string
  description?: string
  cost: number
  quantity: number // -1 = unlimited
  species?: FishSpecies
}
