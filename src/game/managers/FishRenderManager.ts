import { TankContainer } from '../views/TankContainer'
import { Fish } from '../../models/Fish'

export class FishRenderManager {
  private tankView: TankContainer

  constructor(tankView: TankContainer) {
    this.tankView = tankView
  }

  addFish(fish: Fish): void {
    // console.log(
    //   '🎨 FishRenderManager.addFish called for:',
    //   fish.id,
    //   'at position',
    //   fish.x.toFixed(1),
    //   fish.y.toFixed(1)
    // )
    this.tankView.addFish(fish)
    // console.log('✅ Fish added to TankView')
  }

  removeFish(fishId: string): void {
    // console.log('🗑️ FishRenderManager.removeFish called for:', fishId)
    this.tankView.removeFish(fishId)
  }
}

export default FishRenderManager
