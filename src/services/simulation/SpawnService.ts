import { Fish } from '../../models/Fish'
import { getSpeciesColor, randomPosition, randomVelocity, randomSize } from '../../lib/random'
import { FishSpecies, ITankLogic } from '../../models/types'
import {
  DEFAULT_MAX_VELOCITY,
  FISH_SPAWN_SIZE_MIN,
  FISH_SPAWN_SIZE_MAX,
} from '../../lib/constants'
import type FishRenderManager from '../../game/managers/FishRenderManager'

export class SpawnService {
  private tank: ITankLogic
  private renderManager: FishRenderManager

  constructor(tank: ITankLogic, renderManager: FishRenderManager) {
    this.tank = tank
    this.renderManager = renderManager
  }

  spawn(amount: number): void {
    const bounds = this.tank.getSpawnBounds()

    for (let i = 0; i < amount; i++) {
      const id = Math.random().toString(36).substring(7)
      const x = randomPosition(bounds.minX, bounds.maxX)
      const y = randomPosition(bounds.minY, bounds.maxY)
      const color = getSpeciesColor(FishSpecies.GUPPY) // Legacy spawn defaults to GUPPY
      const scale = randomSize(FISH_SPAWN_SIZE_MIN, FISH_SPAWN_SIZE_MAX)

      const fish = new Fish(id, x, y, color, scale)
      fish.vx = randomVelocity(DEFAULT_MAX_VELOCITY)
      fish.vy = randomVelocity(DEFAULT_MAX_VELOCITY)

      this.tank.addFish(fish)
      this.renderManager.addFish(fish)
    }
  }
}

export default SpawnService
