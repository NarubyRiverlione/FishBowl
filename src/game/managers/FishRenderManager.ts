import { TankContainer } from '../views/TankContainer'
import { Fish } from '../../models/Fish'

export class FishRenderManager {
  private tankView: TankContainer

  constructor(tankView: TankContainer) {
    this.tankView = tankView
  }

  addFish(fish: Fish): void {
    this.tankView.addFish(fish)
  }

  removeFish(fishId: string): void {
    this.tankView.removeFish(fishId)
  }
}

export default FishRenderManager
