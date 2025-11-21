import { IFish, FishSpecies, FISH_SPECIES_CONFIG } from '../models/types'
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

export class FishService {
  static createFish(species: FishSpecies): IFish {
    const config = FISH_SPECIES_CONFIG[species]
    const fish = {
      id: crypto.randomUUID(),
      species,
      color: getSpeciesColor(species),
      size: randomSize(config.sizeRange[0], config.sizeRange[1]),
      age: 0,
      health: config.health,
      hunger: 0,
      isAlive: true,
      genetics: {},
      createdAt: Date.now(),
      // Physics properties required by IFish interface
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 24, // Default fish radius
    }
    console.log('🏭 FishService.createFish created:', {
      id: fish.id,
      species: fish.species,
      color: fish.color,
      size: fish.size,
      health: fish.health,
      isAlive: fish.isAlive,
    })
    return fish
  }

  static tickFish(fish: IFish, waterQuality: number = PERCENTAGE_MAX): IFish {
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

  static calculateFishValue(fish: IFish): number {
    const config = FISH_SPECIES_CONFIG[fish.species]
    const ageMultiplier = Math.min(1 + fish.age / FISH_AGE_MAX_MULTIPLIER_DIVISOR, FISH_VALUE_MAX_MULTIPLIER)
    const healthModifier = fish.health / PERCENTAGE_MAX
    return Math.floor(config.baseValue * ageMultiplier * healthModifier)
  }

  static feedFish(fish: IFish): IFish {
    if (!fish.isAlive) return fish
    return {
      ...fish,
      hunger: Math.max(0, fish.hunger - HUNGER_REDUCTION_ON_FEED),
      lastFedAt: Date.now(),
    }
  }
}
