import { Sprite, Texture, Assets } from 'pixi.js'
import { IFish } from '../../models/types/fish'
import fishSvg from '../../assets/fish.svg'
import useGameStore from '../../store/useGameStore'

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
    // Make interactive for click/select/sell
    this.interactive = true
    this.buttonMode = true
    // Attach pointer handler defensively (some test environments don't expose Pixi event methods)
    const attach = (obj: any, ev: string, cb: (...args: any[]) => void) => {
      if (typeof obj.on === 'function') return obj.on(ev, cb)
      if (typeof obj.addEventListener === 'function') return obj.addEventListener(ev, cb)
      if (typeof obj.addListener === 'function') return obj.addListener(ev, cb)
      // Fallback: store handlers on instance for test shims
      obj.__events = obj.__events || {}
      obj.__events[ev] = obj.__events[ev] || []
      obj.__events[ev].push(cb)
    }

    attach(this, 'pointerdown', this.handlePointerDown.bind(this))
  }

  private handlePointerDown(): void {
    try {
      const store = useGameStore.getState()
      // Log the fish GUID for debugging when clicked
      // eslint-disable-next-line no-console
      console.log('Fish clicked id:', this.fish.id)
      if (store.sellMode) {
        // Find the tank that contains this fish
        const tank = store.tanks.find((t) => t.fish.some((f) => f.id === this.fish.id))
        if (tank) {
          store.sellFish(tank.id, this.fish.id)
        }
        // Exit sell mode after an action
        store.setSellMode(false)
      } else {
        store.selectFish(this.fish.id)
      }
    } catch (error) {
      // swallow errors to avoid crashing renderer
      // eslint-disable-next-line no-console
      console.error('Error handling fish click:', error)
    }
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
