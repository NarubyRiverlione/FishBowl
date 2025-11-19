import { Container, Graphics } from 'pixi.js'
import { ITank } from '../types/tank'

export class TankView extends Container {
  private tank: ITank
  private background: Graphics

  constructor(tank: ITank) {
    super()
    this.tank = tank
    this.background = new Graphics()
    this.addChild(this.background)
    this.draw()
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
