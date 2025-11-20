import { Container, Graphics } from 'pixi.js'
import { ITank } from '../../models/types/tank'
import { IFish } from '../../models/types/fish'
import { FishSprite } from './FishSprite'
import { WATER_LEVEL } from '../../lib/constants'

export class TankContainer extends Container {
  private tank: ITank
  private background: Graphics
  private fishSprites: Map<string, FishSprite> = new Map()

  constructor(tank: ITank) {
    super()
    this.tank = tank
    this.background = new Graphics()
    this.addChild(this.background)
    this.draw()
  }

  addFish(fish: IFish): void {
    const sprite = new FishSprite(fish)
    this.fishSprites.set(fish.id, sprite)
    this.addChild(sprite)
  }

  removeFish(id: string): void {
    const sprite = this.fishSprites.get(id)
    if (sprite) {
      if (sprite.parent) this.removeChild(sprite)
      this.fishSprites.delete(id)
    }
  }

  update(): void {
    for (const sprite of this.fishSprites.values()) {
      sprite.update()
    }
  }

  private draw(): void {
    this.background.clear()

    const waterLevel = this.tank.height * WATER_LEVEL

    // Draw water (filled portion)
    this.background.rect(0, this.tank.height - waterLevel, this.tank.width, waterLevel)
    this.background.fill(this.tank.backgroundColor)

    // Draw tank walls (bottom and sides only, no top)
    this.background.rect(0, 0, this.tank.width, this.tank.height)
    this.background.stroke({ width: 4, color: 0x888888 })

    // Draw water surface line
    this.background
      .moveTo(0, this.tank.height - waterLevel)
      .lineTo(this.tank.width, this.tank.height - waterLevel)
      .stroke({ width: 2, color: 0x66aaff, alpha: 0.6 })
  }
}

export default TankContainer
