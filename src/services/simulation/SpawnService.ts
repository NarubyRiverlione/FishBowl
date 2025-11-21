import { Tank } from '../../models/Tank'
import { Fish } from '../../models/Fish'
import { getSpeciesColor, randomPosition, randomVelocity, randomSize } from '../../lib/random'
import { FishSpecies } from '../../models/types'
import {
  WATER_LEVEL,
  SPAWN_BUFFER,
  DEFAULT_MAX_VELOCITY,
  FISH_SPAWN_SIZE_MIN,
  FISH_SPAWN_SIZE_MAX,
} from '../../lib/constants'
import type FishRenderManager from '../../game/managers/FishRenderManager'

export class SpawnService {
  private tank: Tank
  private renderManager: FishRenderManager

  constructor(tank: Tank, renderManager: FishRenderManager) {
    this.tank = tank
    this.renderManager = renderManager
  }

  spawn(amount: number): void {
    const waterHeight = this.tank.height * WATER_LEVEL
    const waterTop = this.tank.height - waterHeight

    for (let i = 0; i < amount; i++) {
      const id = Math.random().toString(36).substring(7)
      const x = randomPosition(0, this.tank.width)
      const y = randomPosition(waterTop + SPAWN_BUFFER, this.tank.height - SPAWN_BUFFER)
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
