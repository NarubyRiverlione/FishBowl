import { ITankData, FishSpecies } from '../models/types'
import { FISH_SPECIES_CONFIG } from '../lib/constants'
import { FEED_BASE_COST, FEED_PER_FISH_COST, CLEAN_COST, FILTER_COST, TANK_UPGRADE_COST } from '../lib/constants'

export class EconomyService {
  static getFishCost(species: FishSpecies): number {
    return FISH_SPECIES_CONFIG[species].baseValue
  }

  static canBuyFish(credits: number, tank: ITankData, species: FishSpecies): boolean {
    const cost = this.getFishCost(species)
    const livingFishCount = tank.fish.filter((f) => f.isAlive).length
    const isFull = livingFishCount >= tank.capacity
    return credits >= cost && !isFull
  }

  static getFeedCost(livingFishCount: number): number {
    return FEED_BASE_COST + FEED_PER_FISH_COST * livingFishCount
  }

  static canFeed(credits: number, livingFishCount: number): boolean {
    return credits >= this.getFeedCost(livingFishCount) && livingFishCount > 0
  }

  static getCleanCost(): number {
    return CLEAN_COST
  }

  static canClean(credits: number): boolean {
    return credits >= CLEAN_COST
  }

  static getFilterCost(): number {
    return FILTER_COST
  }

  static canBuyFilter(credits: number, tank: ITankData): boolean {
    return credits >= FILTER_COST && tank.size === 'STANDARD' && !tank.hasFilter
  }

  static getTankUpgradeCost(): number {
    return TANK_UPGRADE_COST
  }

  static canUpgradeTank(credits: number, tank: ITankData): boolean {
    return credits >= TANK_UPGRADE_COST && tank.size === 'BOWL'
  }
}
