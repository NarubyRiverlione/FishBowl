import { Sprite, Texture, Assets } from 'pixi.js'
import { IFish } from '../../models/types/fish'
import fishSvg from '../../assets/fish.svg'

export class FishSprite extends Sprite {
  private fish: IFish
  private static texturePromise: Promise<Texture> | null = null

  constructor(fish: IFish) {
    super(Texture.EMPTY)
    this.fish = fish

    this.width = fish.width
    this.height = fish.height
    this.tint = parseInt(fish.color.replace('#', ''), 16)
    this.anchor.set(0.5) // Center anchor

    // Load texture asynchronously
    this.loadTexture()
    this.update()
  }

  private async loadTexture(): Promise<void> {
    try {
      // Cache the texture promise so we only load once
      if (!FishSprite.texturePromise) {
        FishSprite.texturePromise = Assets.load(fishSvg)
      }
      const texture = await FishSprite.texturePromise
      this.texture = texture
      // Reapply size and tint after texture loads
      this.width = this.fish.width
      this.height = this.fish.height
      this.tint = parseInt(this.fish.color.replace('#', ''), 16)
    } catch (error) {
      console.error('Failed to load fish texture:', error)
    }
  }

  update(): void {
    this.x = this.fish.x
    this.y = this.fish.y

    // Rotate based on velocity
    if (this.fish.vx !== 0 || this.fish.vy !== 0) {
      this.rotation = Math.atan2(this.fish.vy, this.fish.vx)
    }
  }
}

export default FishSprite
