import { Tank } from '../../models/Tank'
import { TankContainer } from '../views/TankContainer'
import { FishRenderManager } from '../managers/FishRenderManager'
import { SpawnService } from '../../services/simulation/SpawnService'
import { IFish } from '../../models/types'
import { Fish } from '../../models/Fish'

export class FishController {
  private tank: Tank
  private tankView: TankContainer
  private renderManager: FishRenderManager
  private spawnService: SpawnService

  constructor(tank: Tank, tankView: TankContainer) {
    this.tank = tank
    this.tankView = tankView
    this.renderManager = new FishRenderManager(this.tankView)
    this.spawnService = new SpawnService(this.tank, this.renderManager)
  }

  spawn(amount: number): void {
    this.spawnService.spawn(amount)
  }

  syncFish(storeFish: IFish[]): void {
    // 1. Identify fish to add (in store, not in tank)
    const currentFishIds = new Set(this.tank.fish.map((f) => f.id))
    const fishToAdd = storeFish.filter((f) => !currentFishIds.has(f.id))

    // 2. Identify fish to remove (in tank, not in store)
    const storeFishIds = new Set(storeFish.map((f) => f.id))
    const fishToRemove = this.tank.fish.filter((f) => !storeFishIds.has(f.id))

    // 3. Add new fish
    fishToAdd.forEach((f) => {
      // Store doesn't track position, so we spawn at random position or center
      // Ideally we should persist position in store if we want persistence across reloads
      const x = Math.random() * this.tank.width
      const y = Math.random() * this.tank.height

      const fishModel = new Fish(f.id, x, y, f.color, f.size)

      fishModel.species = f.species
      fishModel.genetics = f.genetics
      fishModel.hunger = f.hunger
      fishModel.health = f.health
      fishModel.age = f.age

      this.tank.addFish(fishModel)
      this.renderManager.addFish(fishModel)
    })
    // 4. Remove old fish
    fishToRemove.forEach((f) => {
      this.tank.removeFish(f.id)
      this.renderManager.removeFish(f.id)
    })
  }
}

export default FishController
