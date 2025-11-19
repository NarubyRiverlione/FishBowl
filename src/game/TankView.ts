import { Container, Graphics } from 'pixi.js'
import { ITank } from '../types/tank'
import { IFish } from '../types/fish'
import { FishSprite } from './FishSprite'

export class TankView extends Container {
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

  update(): void {
    for (const sprite of this.fishSprites.values()) {
      sprite.update()
    }
  }

  private draw(): void {
    this.background.clear()

    // Draw water
    this.background.rect(0, 0, this.tank.width, this.tank.height)
    this.background.fill(this.tank.backgroundColor)

    // Draw border
    this.background.stroke({ width: 4, color: 0xffffff })
  }
}
