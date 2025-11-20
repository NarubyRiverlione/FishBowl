import { IFish, FishSpecies, FISH_SPECIES_CONFIG } from '../models/types'
import { randomColor, randomSize } from '../lib/random'
import {
  HEALTH_DECREMENT_ON_STARVATION,
  HUNGER_STARVATION_THRESHOLD,
  HUNGER_REDUCTION_ON_FEED,
  HEALTH_DECREMENT_ON_POLLUTION,
} from '../lib/constants'

export class FishService {
  static createFish(species: FishSpecies): IFish {
    const config = FISH_SPECIES_CONFIG[species]
    return {
      id: crypto.randomUUID(),
      species,
      color: randomColor(),
      size: randomSize(config.sizeRange[0], config.sizeRange[1]),
      age: 0,
      health: config.health,
      hunger: 0,
      isAlive: true,
      genetics: {},
      createdAt: Date.now(),
    }
  }

  static tickFish(fish: IFish, waterQuality: number = 100): IFish {
    if (!fish.isAlive) return fish

    const config = FISH_SPECIES_CONFIG[fish.species]
    const newAge = fish.age + 1
    const newHunger = Math.min(100, fish.hunger + config.hungerRate)

    let newHealth = fish.health
    if (newHunger >= HUNGER_STARVATION_THRESHOLD) {
      newHealth = Math.max(0, newHealth - HEALTH_DECREMENT_ON_STARVATION)
    }

    if (waterQuality < 50) {
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
    const ageMultiplier = Math.min(1 + fish.age / 300, 2.0)
    const healthModifier = fish.health / 100
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
