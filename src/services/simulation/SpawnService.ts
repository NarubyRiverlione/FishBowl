import { Tank } from '../../models/Tank'
import { Fish } from '../../models/Fish'
import { randomColor, randomPosition, randomVelocity, randomSize } from '../../lib/random'
import { WATER_LEVEL } from '../../lib/constants'
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
      const y = randomPosition(waterTop + 50, this.tank.height - 50)
      const color = randomColor()
      const scale = randomSize(0.5, 1.5)

      const fish = new Fish(id, x, y, color, scale)
      fish.vx = randomVelocity(2)
      fish.vy = randomVelocity(2)

      this.tank.addFish(fish)
      this.renderManager.addFish(fish)
    }
  }
}

export default SpawnService
