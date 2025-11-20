import { Tank } from '../../models/Tank'
import { TankContainer } from '../views/TankContainer'
import { FishRenderManager } from '../managers/FishRenderManager'
import { SpawnService } from '../../services/simulation/SpawnService'

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
}

export default FishController
