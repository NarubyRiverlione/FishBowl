import { IFishLogic, FishSpecies } from '../models/types'
import { FISH_SPECIES_CONFIG } from '../lib/constants'
import { getSpeciesColor, randomSize } from '../lib/random'
import {
  HEALTH_DECREMENT_ON_STARVATION,
  HUNGER_STARVATION_THRESHOLD,
  HUNGER_REDUCTION_ON_FEED,
  HEALTH_DECREMENT_ON_POLLUTION,
  WATER_QUALITY_POOR_THRESHOLD,
  FISH_AGE_MAX_MULTIPLIER_DIVISOR,
  FISH_VALUE_MAX_MULTIPLIER,
  PERCENTAGE_MAX,
} from '../lib/constants'

import { Fish } from '../models/Fish'
export class FishService {
  static createFish(species: FishSpecies): IFishLogic {
    const config = FISH_SPECIES_CONFIG[species]
    // Create a Fish instance which implements IFishLogic
    const fish = new Fish(
      crypto.randomUUID(),
      0,
      0,
      getSpeciesColor(species),
      randomSize(config.sizeRange[0], config.sizeRange[1])
    )
    fish.species = species
    fish.health = config.health
    // console.log('🏭 FishService.createFish created:', {
    //   id: fish.id,
    //   species: fish.species,
    //   color: fish.color,
    //   size: fish.size,
    //   health: fish.health,
    //   isAlive: fish.isAlive,
    // })
    return fish
  }

  static tickFish(fish: IFishLogic, waterQuality: number = PERCENTAGE_MAX): IFishLogic {
    if (!fish.isAlive) return fish

    const config = FISH_SPECIES_CONFIG[fish.species]
    const newAge = fish.age + 1
    const newHunger = Math.min(PERCENTAGE_MAX, fish.hunger + config.hungerRate)

    let newHealth = fish.health
    if (newHunger >= HUNGER_STARVATION_THRESHOLD) {
      newHealth = Math.max(0, newHealth - HEALTH_DECREMENT_ON_STARVATION)
    }

    if (waterQuality < WATER_QUALITY_POOR_THRESHOLD) {
      newHealth = Math.max(0, newHealth - HEALTH_DECREMENT_ON_POLLUTION)
    }

    return {
      ...fish,
      age: newAge,
      hunger: newHunger,
      health: newHealth,
      isAlive: newHealth > 0,
    }
  }

  static calculateFishValue(fish: IFishLogic): number {
    const config = FISH_SPECIES_CONFIG[fish.species]
    const ageMultiplier = Math.min(1 + fish.age / FISH_AGE_MAX_MULTIPLIER_DIVISOR, FISH_VALUE_MAX_MULTIPLIER)
    const healthModifier = fish.health / PERCENTAGE_MAX
    return Math.floor(config.baseValue * ageMultiplier * healthModifier)
  }

  static feedFish(fish: IFishLogic): IFishLogic {
    if (!fish.isAlive) return fish
    return {
      ...fish,
      hunger: Math.max(0, fish.hunger - HUNGER_REDUCTION_ON_FEED),
      lastFedAt: Date.now(),
    }
  }
}
