import { TankContainer } from '../views/TankContainer'
import { FishRenderManager } from '../managers/FishRenderManager'
import { SpawnService } from '../../services/simulation/SpawnService'
import { IFishData, ITankLogic } from '../../models/types'
import { Fish } from '../../models/Fish'

export class FishController {
  private tank: ITankLogic
  private tankView: TankContainer
  private renderManager: FishRenderManager
  private spawnService: SpawnService

  constructor(tank: ITankLogic, tankView: TankContainer) {
    this.tank = tank
    this.tankView = tankView
    this.renderManager = new FishRenderManager(this.tankView)
    this.spawnService = new SpawnService(this.tank, this.renderManager)
  }

  spawn(amount: number): void {
    this.spawnService.spawn(amount)
  }

  syncFish(storeFish: IFishData[]): void {
    // console.log('🎣 FishController.syncFish called with:', storeFish.length, 'fish')

    // 1. Update existing fish with current store data (age, health, hunger)
    const storeFishMap = new Map(storeFish.map((f) => [f.id, f]))
    this.tank.fish.forEach((tankFish) => {
      const storeFish = storeFishMap.get(tankFish.id)
      if (storeFish) {
        // Sync properties that change over time
        tankFish.age = storeFish.age
        tankFish.health = storeFish.health
        tankFish.hunger = storeFish.hunger
        tankFish.isAlive = storeFish.isAlive
      }
    })

    // 2. Identify fish to add (in store, not in tank)
    const currentFishIds = new Set(this.tank.fish.map((f) => f.id))
    const fishToAdd = storeFish.filter((f) => !currentFishIds.has(f.id))
    // console.log(
    //   '➕ Fish to add:',
    //   fishToAdd.length,
    //   'fish IDs:',
    //   fishToAdd.map((f) => f.id)
    // )

    // 3. Identify fish to remove (in tank, not in store)
    const storeFishIds = new Set(storeFish.map((f) => f.id))
    const fishToRemove = this.tank.fish.filter((f) => !storeFishIds.has(f.id))
    // console.log('➖ Fish to remove:', fishToRemove.length)

    // 4. Add new fish
    fishToAdd.forEach((f) => {
      // Store doesn't track position, so we spawn at random position within safe bounds
      // Ideally we should persist position in store if we want persistence across reloads
      const bounds = this.tank.getSpawnBounds()
      const x = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX
      const y = Math.random() * (bounds.maxY - bounds.minY) + bounds.minY

      const fishModel = new Fish(f.id, x, y, f.color, f.size)

      fishModel.species = f.species
      fishModel.genetics = f.genetics
      fishModel.hunger = f.hunger
      fishModel.health = f.health
      fishModel.age = f.age

      // console.log('🐟 Adding fish to tank and render:', f.id, 'at', x.toFixed(1), y.toFixed(1))
      this.tank.addFish(fishModel)
      this.renderManager.addFish(fishModel)
    })
    // 5. Remove old fish
    fishToRemove.forEach((f) => {
      // console.log('🗑️ Removing fish:', f.id)
      this.tank.removeFish(f.id)
      this.renderManager.removeFish(f.id)
    })
    // console.log('✅ FishController sync complete. Tank fish:', this.tank.fish.length, 'Render manager ready')
  }
}

export default FishController
