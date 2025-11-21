import { Sprite, Texture, Assets } from 'pixi.js'
import { IFish } from '../../models/types'
import fishSvg from '../../assets/fish.svg'
import useGameStore from '../../store/useGameStore'
import { getLifeStage, getLifeStageSizeMultiplier, getLifeStageColorSaturation } from '../../lib/fishHelpers'

export class FishSprite extends Sprite {
  private fish: IFish
  private static texturePromise: Promise<Texture> | null = null

  constructor(fish: IFish, initialX: number = 100, initialY: number = 100) {
    super(Texture.EMPTY)
    console.log('🐟 Creating FishSprite for:', fish.id, 'at', initialX.toFixed(1), initialY.toFixed(1))
    this.fish = fish

    // Initialize Fish model position (Fish model handles all physics)
    this.fish.x = initialX
    this.fish.y = initialY

    // Set initial sprite position to match Fish model
    this.x = this.fish.x
    this.y = this.fish.y

    // Apply life stage visual effects
    this.applyLifeStageVisuals()
    this.anchor.set(0.5) // Center anchor

    // Load texture asynchronously
    this.loadTexture()

    // Make interactive for click/select/sell
    this.interactive = true
    ;(this as Sprite & { buttonMode?: boolean }).buttonMode = true
    // Attach pointer handler defensively (some test environments don't expose Pixi event methods)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attach = (obj: any, ev: string, cb: (...args: any[]) => void) => {
      if (typeof obj.on === 'function') return obj.on(ev, cb)
      if (typeof obj.addEventListener === 'function') return obj.addEventListener(ev, cb)
      if (typeof obj.addListener === 'function') return obj.addListener(ev, cb)
      // Fallback: store handlers on instance for test shims
      obj.__events = obj.__events || {}
      obj.__events[ev] = obj.__events[ev] || []
      obj.__events[ev].push(cb)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attach(this as any, 'pointerdown', this.handlePointerDown.bind(this))
  }

  private handlePointerDown(): void {
    try {
      const store = useGameStore.getState()
      // Log the fish GUID for debugging when clicked

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

      console.error('Error handling fish click:', error)
    }
  }

  private async loadTexture(): Promise<void> {
    try {
      console.log('🖼️ Loading texture for fish:', this.fish.id)
      // Cache the texture promise so we only load once
      if (!FishSprite.texturePromise) {
        console.log('🌐 First texture load - creating promise')
        FishSprite.texturePromise = Assets.load(fishSvg)
      }
      const texture = await FishSprite.texturePromise
      console.log('✅ Texture loaded for fish:', this.fish.id, 'Texture size:', texture.width, 'x', texture.height)
      this.texture = texture
      // Reapply visual effects after texture loads
      this.applyLifeStageVisuals()
      console.log('🎨 Fish sprite initial state:', {
        id: this.fish.id,
        position: { x: this.x, y: this.y },
        size: { width: this.width, height: this.height },
        visible: this.visible,
        alpha: this.alpha,
        tint: this.tint.toString(16),
      })
    } catch (error) {
      console.error('Failed to load fish texture:', error)
    }
  }

  private applyLifeStageVisuals(): void {
    const lifeStage = getLifeStage(this.fish.age)
    const sizeMultiplier = getLifeStageSizeMultiplier(lifeStage)
    const saturationMultiplier = getLifeStageColorSaturation(lifeStage)

    // Apply size based on fish size property and life stage multiplier
    const baseSize = this.fish.size || 1.0
    const finalSize = baseSize * sizeMultiplier

    // Use scale instead of width/height to avoid massive pixel dimensions
    // Safety check for scale property (may be undefined in test environment)
    if (this.scale) {
      this.scale.set(finalSize)
    }

    // console.log('🎨 Applied life stage visuals:', {
    //   fishId: this.fish.id,
    //   lifeStage,
    //   baseSize,
    //   sizeMultiplier,
    //   finalSize,
    //   scale: this.scale ? this.scale.x : 'undefined',
    // })

    // Apply color with saturation modification for old fish
    const baseColor = parseInt(this.fish.color.replace('#', ''), 16)
    if (saturationMultiplier < 1.0) {
      // Desaturate the color for old fish
      const r = (baseColor >> 16) & 0xff
      const g = (baseColor >> 8) & 0xff
      const b = baseColor & 0xff

      // Convert to grayscale and blend back
      const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114)
      const blendFactor = 1 - saturationMultiplier

      const newR = Math.round(r * (1 - blendFactor) + gray * blendFactor)
      const newG = Math.round(g * (1 - blendFactor) + gray * blendFactor)
      const newB = Math.round(b * (1 - blendFactor) + gray * blendFactor)

      this.tint = (newR << 16) | (newG << 8) | newB
    } else {
      this.tint = baseColor
    }
  }

  update(): void {
    // Sync sprite position with Fish model (Fish model handles all physics and collision detection)
    this.x = this.fish.x
    this.y = this.fish.y

    // Apply life stage visual effects (in case age changed)
    this.applyLifeStageVisuals()

    // Rotate based on velocity from Fish model
    if (this.fish.vx !== 0 || this.fish.vy !== 0) {
      this.rotation = Math.atan2(this.fish.vy, this.fish.vx)
    }

    // console.log('🎨 FishSprite.update synced with Fish model:', {
    //   fishId: this.fish.id,
    //   modelPos: {
    //     x: this.fish.x ? this.fish.x.toFixed(1) : '0',
    //     y: this.fish.y ? this.fish.y.toFixed(1) : '0',
    //   },
    //   spritePos: {
    //     x: this.x ? this.x.toFixed(1) : '0',
    //     y: this.y ? this.y.toFixed(1) : '0',
    //   },
    //   velocity: {
    //     vx: this.fish.vx ? this.fish.vx.toFixed(2) : '0',
    //     vy: this.fish.vy ? this.fish.vy.toFixed(2) : '0',
    //   },
    //   effectiveRadius: this.fish.getEffectiveRadius ? this.fish.getEffectiveRadius().toFixed(1) : 'N/A',
    // })
  }
}

export default FishSprite
