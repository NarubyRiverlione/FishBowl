/**
 * Fish lifecycle helper utilities
 */

import {
  FISH_AGE_YOUNG_MAX,
  FISH_AGE_MATURE_MAX,
  FISH_LIFE_STAGE_YOUNG_SCALE,
  FISH_LIFE_STAGE_MATURE_SCALE,
  FISH_LIFE_STAGE_OLD_SCALE,
  FISH_LIFE_STAGE_OLD_SATURATION,
  DEV_MODE_YOUNG_AGE,
  DEV_MODE_MATURE_AGE,
  DEV_MODE_OLD_AGE,
} from './constants'
import { FishService } from '../services/FishService'
import { FishSpecies } from '../models/types'

export type LifeStage = 'young' | 'mature' | 'old'

/**
 * Determines the life stage of a fish based on its age
 * @param age Fish age in ticks
 * @returns The life stage classification
 */
export function getLifeStage(age: number): LifeStage {
  if (age < FISH_AGE_YOUNG_MAX) return 'young'
  if (age < FISH_AGE_MATURE_MAX) return 'mature'
  return 'old'
}

/**
 * Get the size multiplier for a fish based on its life stage
 * @param lifeStage The fish's life stage
 * @returns Size multiplier (1.0 for young, 1.3 for mature/old)
 */
export function getLifeStageSizeMultiplier(lifeStage: LifeStage): number {
  switch (lifeStage) {
    case 'young':
      return FISH_LIFE_STAGE_YOUNG_SCALE
    case 'mature':
      return FISH_LIFE_STAGE_MATURE_SCALE
    case 'old':
      return FISH_LIFE_STAGE_OLD_SCALE
    default:
      return FISH_LIFE_STAGE_YOUNG_SCALE
  }
}

/**
 * Get the color saturation multiplier for a fish based on its life stage
 * @param lifeStage The fish's life stage
 * @returns Saturation multiplier (1.0 for young/mature, 0.8 for old)
 */
export function getLifeStageColorSaturation(lifeStage: LifeStage): number {
  switch (lifeStage) {
    case 'young':
    case 'mature':
      return 1.0 // Full saturation for young and mature fish
    case 'old':
      return FISH_LIFE_STAGE_OLD_SATURATION
    default:
      return 1.0 // Default to full saturation
  }
}

/**
 * Creates fish for developer mode with one fish of each species and age group
 * @returns Array of 12 fish (4 species x 3 age groups)
 */
export function createDeveloperModeFish() {
  const fish = []
  const species = [FishSpecies.GUPPY, FishSpecies.GOLDFISH, FishSpecies.TETRA, FishSpecies.BETTA]
  const ageGroups = [
    { name: 'young', age: DEV_MODE_YOUNG_AGE },
    { name: 'mature', age: DEV_MODE_MATURE_AGE },
    { name: 'old', age: DEV_MODE_OLD_AGE },
  ]

  for (const spec of species) {
    for (const ageGroup of ageGroups) {
      const newFish = FishService.createFish(spec)
      newFish.age = ageGroup.age
      newFish.name = `${spec.toLowerCase()}-${ageGroup.name}`
      fish.push(newFish)
    }
  }

  return fish
}
