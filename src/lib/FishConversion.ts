import { Fish } from '../models/Fish'
import { IFishData, IFishLogic } from '../models/types/fish'

/**
 * Converts IFishData from store to Fish instance (IFishLogic) for services
 */
export const fishDataToLogic = (fishData: IFishData): IFishLogic => {
  const fish = new Fish(
    fishData.id,
    fishData.geometry.position.x,
    fishData.geometry.position.y,
    fishData.color,
    fishData.size
  )

  // Restore all state properties from fishData
  fish.species = fishData.species
  fish.name = fishData.name
  fish.age = fishData.age
  fish.health = fishData.health
  fish.hunger = fishData.hunger
  fish.isAlive = fishData.isAlive
  fish.genetics = fishData.genetics
  fish.createdAt = fishData.createdAt
  fish.lastFedAt = fishData.lastFedAt

  // Restore full geometry state including velocity
  fish.geometry = { ...fishData.geometry }

  return fish
}

/**
 * Converts Fish instance (IFishLogic) back to IFishData for store
 */
export const fishLogicToData = (fishLogic: IFishLogic): IFishData => {
  return {
    id: fishLogic.id,
    species: fishLogic.species,
    name: fishLogic.name,
    color: fishLogic.color,
    size: fishLogic.size,
    age: fishLogic.age,
    health: fishLogic.health,
    hunger: fishLogic.hunger,
    isAlive: fishLogic.isAlive,
    genetics: fishLogic.genetics,
    createdAt: fishLogic.createdAt,
    lastFedAt: fishLogic.lastFedAt,
    geometry: fishLogic.geometry,
  }
}
