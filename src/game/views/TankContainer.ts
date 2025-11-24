import { Container, Sprite, Texture, Assets, Graphics } from 'pixi.js'
import { ITankLogic, IFishLogic } from '../../models/types'
import { FishSprite } from './FishSprite'
import fishbowlSvg from '../../assets/fishbowl.svg'
import recttankSvg from '../../assets/recttank.svg'
import {
  TANK_DISPLAY_MIN_SIZE,
  TANK_DISPLAY_MAX_SIZE,
  MOBILE_BREAKPOINT,
  DESKTOP_BREAKPOINT,
} from '../../lib/constants'
import useGameStore from '../../store/useGameStore'

export class TankContainer extends Container {
  private tank: ITankLogic
  private fishSprites: Map<string, FishSprite> = new Map()
  private displayScale: number = 1
  private bowlSprite: Sprite | null = null
  private floorGraphics: Graphics | null = null
  // Force fresh texture load on each session - helps with development
  private static textureCache: Map<string, Promise<Texture>> = new Map()

  static clearBowlCache(): void {
    TankContainer.textureCache.clear()
  }

  constructor(tank: ITankLogic) {
    super()
    this.tank = tank
    this.calculateDisplayScale()
    this.initializeBowl()
    this.initializeFloor()
    // Allow clicking on empty tank area to clear selection
    this.interactive = true
    // Attach pointer handler defensively (tests may not provide Pixi event methods)
    type EventEmitterLike = {
      on?: (event: string, callback: (...args: unknown[]) => void) => void
      addEventListener?: (event: string, callback: (...args: unknown[]) => void) => void
      addListener?: (event: string, callback: (...args: unknown[]) => void) => void
      __events?: Record<string, ((...args: unknown[]) => void)[]>
    }

    const attach = (obj: EventEmitterLike, ev: string, cb: (...args: unknown[]) => void) => {
      if (typeof obj.on === 'function') return obj.on(ev, cb)
      if (typeof obj.addEventListener === 'function') return obj.addEventListener(ev, cb)
      if (typeof obj.addListener === 'function') return obj.addListener(ev, cb)
      obj.__events = obj.__events || {}
      obj.__events[ev] = obj.__events[ev] || []
      obj.__events[ev].push(cb)
    }

    attach(this as EventEmitterLike, 'pointerdown', (...args: unknown[]) => {
      // If the click target is not a FishSprite, clear selection
      const e = args[0] as { target?: unknown }
      const target = e?.target
      if (!(target instanceof FishSprite)) {
        useGameStore.getState().selectFish(null)
      }
    })
  }

  addFish(fish: IFishLogic): void {
    // console.log('🏠 TankContainer.addFish called for:', fish.id, 'Tank size:', this.tank.geometry.width, 'x', this.tank.geometry.height)
    // Generate random initial position within tank bounds, below water line
    // Use tank's spawn bounds to ensure fish are within physics boundaries
    const bounds = this.tank.getSpawnBounds()

    // Ensure we respect the bounds returned by the tank
    // getSpawnBounds returns the safe area for a standard fish.
    // We add a small buffer for the specific fish radius if needed,
    // but getSpawnBounds already includes a safe margin.
    // To be extra safe, we ensure the fish center is within the bounds.

    const minX = bounds.minX
    const maxX = bounds.maxX
    const minY = bounds.minY
    const maxY = bounds.maxY

    const initialX = Math.random() * (maxX - minX) + minX
    const initialY = Math.random() * (maxY - minY) + minY

    const sprite = new FishSprite(fish, initialX, initialY)
    this.fishSprites.set(fish.id, sprite)

    // Add fish sprite above the tank sprite (ensure fish are always on top)
    // If bowlSprite exists, add fish after it in the display list
    if (this.bowlSprite && this.bowlSprite.parent === this) {
      const bowlIndex = this.getChildIndex(this.bowlSprite)
      this.addChildAt(sprite, bowlIndex + 1)
    } else {
      this.addChild(sprite)
    }
    // console.log(
    //   '🎭 Fish sprite created and added to container. Sprite visible?',
    //   sprite.visible,
    //   'Alpha:',
    //   sprite.alpha,
    //   'Scale:',
    //   sprite.scale ? sprite.scale.x : 'undefined'
    // )
    try {
      // If test helpers are enabled, expose diagnostic info when sprites are added

      ;(
        globalThis as typeof globalThis & {
          __TEST_HELPERS__?: {
            _lastAddedFishId?: string
            _addedSpritesCount?: number
          }
        }
      ).__TEST_HELPERS__ =
        (
          globalThis as typeof globalThis & {
            __TEST_HELPERS__?: {
              _lastAddedFishId?: string
              _addedSpritesCount?: number
            }
          }
        ).__TEST_HELPERS__ || {}
      ;(
        globalThis as typeof globalThis & {
          __TEST_HELPERS__?: {
            _lastAddedFishId?: string
            _addedSpritesCount?: number
          }
        }
      ).__TEST_HELPERS__!._lastAddedFishId = fish.id
      // `fishSprites` is a Map, use `size` to report accurate count
      ;(
        globalThis as typeof globalThis & {
          __TEST_HELPERS__?: {
            _lastAddedFishId?: string
            _addedSpritesCount?: number
          }
        }
      ).__TEST_HELPERS__!._addedSpritesCount = this.fishSprites.size
      // Also write a debug console so browser logs capture sprite adds

      console.debug('TankContainer.addFish - added', fish.id, 'sprites=', this.fishSprites.size)
    } catch {
      // ignore
    }
  }

  // Return fish positions in container/global stage coordinates
  public getFishScreenPositions(): Array<{ id: string; x: number; y: number }> {
    const out: Array<{ id: string; x: number; y: number }> = []
    for (const [id, sprite] of this.fishSprites.entries()) {
      let gx = sprite.x
      let gy = sprite.y
      try {
        if ('getGlobalPosition' in sprite && typeof sprite.getGlobalPosition === 'function') {
          const pt = sprite.getGlobalPosition()
          gx = pt.x
          gy = pt.y
        } else {
          // Fallback: accumulate parent positions
          let node: { x?: number; y?: number; parent?: unknown } | null = sprite
          let accX = 0
          let accY = 0
          while (node) {
            accX += node.x || 0
            accY += node.y || 0
            node = node.parent as { x?: number; y?: number; parent?: unknown } | null
          }
          gx = accX
          gy = accY
        }
      } catch {
        // ignore and use local coords
      }
      out.push({ id, x: gx, y: gy })
    }
    return out
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

  private calculateDisplayScale(): void {
    // Get viewport dimensions
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024

    if (viewportWidth < MOBILE_BREAKPOINT) {
      // Mobile: full width with aspect ratio preservation
      const availableWidth = viewportWidth - 40 // Account for padding
      this.displayScale = Math.min(
        availableWidth / this.tank.geometry.width,
        TANK_DISPLAY_MAX_SIZE / Math.max(this.tank.geometry.width, this.tank.geometry.height)
      )
    } else if (viewportWidth < DESKTOP_BREAKPOINT) {
      // Tablet: constrained scaling
      const availableWidth = viewportWidth / 2 - 60 // Two tanks side by side
      this.displayScale = Math.min(
        availableWidth / this.tank.geometry.width,
        TANK_DISPLAY_MAX_SIZE / Math.max(this.tank.geometry.width, this.tank.geometry.height)
      )
    } else {
      // Desktop: optimized scaling (300-600px range)
      const targetSize = Math.min(Math.max(TANK_DISPLAY_MIN_SIZE, viewportWidth / 4), TANK_DISPLAY_MAX_SIZE)
      this.displayScale = targetSize / Math.max(this.tank.geometry.width, this.tank.geometry.height)
    }

    // Ensure scale never goes below minimum or above maximum
    this.displayScale = Math.max(
      TANK_DISPLAY_MIN_SIZE / Math.max(this.tank.geometry.width, this.tank.geometry.height),
      Math.min(this.displayScale, TANK_DISPLAY_MAX_SIZE / Math.max(this.tank.geometry.width, this.tank.geometry.height))
    )

    // Apply scale to this container (affects visual display only)
    // Only set scale if this.scale is available (not in unit tests)
    if (this.scale && typeof this.scale.set === 'function') {
      this.scale.set(this.displayScale)
    }
  }

  public updateDisplayScale(): void {
    const oldScale = this.displayScale
    this.calculateDisplayScale()

    // If scale changed significantly, trigger canvas resize via parent engine
    if (Math.abs(this.displayScale - oldScale) > 0.1) {
      const newCanvasWidth = Math.round(this.tank.geometry.width * this.displayScale)
      const newCanvasHeight = Math.round(this.tank.geometry.height * this.displayScale)

      // Emit resize event that the rendering engine can listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('tankCanvasResize', {
            detail: { width: newCanvasWidth, height: newCanvasHeight },
          })
        )
      }
    }
  }

  private initializeFloor(): void {
    const floor = this.tank.floor
    if (!floor) return

    // Only render visible floors
    if (!floor.visible) return

    this.floorGraphics = new Graphics()

    // Draw floor based on type
    if (floor.type === 'invisible') {
      // Invisible floor - no rendering needed but collision still works
      return
    }

    const color = floor.color ?? 0xc9a961
    const opacity = floor.opacity ?? 0.8

    // Draw floor rectangle with procedural texture pattern
    this.floorGraphics.rect(floor.geometry.x, floor.geometry.y, floor.geometry.width, floor.geometry.height)
    this.floorGraphics.fill({ color, alpha: opacity })

    // Add procedural pebble/sand texture pattern
    const pattern = new Graphics()
    const dotSize = floor.type === 'pebble' ? 3 : 4
    const dotSpacing = floor.type === 'pebble' ? 12 : 15

    for (let x = floor.geometry.x; x < floor.geometry.x + floor.geometry.width; x += dotSpacing) {
      for (let y = floor.geometry.y; y < floor.geometry.y + floor.geometry.height; y += dotSpacing) {
        // Add slight variation to make texture more natural
        const offsetX = (Math.random() - 0.5) * dotSpacing * 0.3
        const offsetY = (Math.random() - 0.5) * dotSpacing * 0.3
        const size = dotSize * (0.8 + Math.random() * 0.4)

        pattern.circle(x + offsetX, y + offsetY, size)
        pattern.fill({ color: 0x000000, alpha: 0.15 })
      }
    }

    this.floorGraphics.addChild(pattern)
    this.addChild(this.floorGraphics)
  }

  private async initializeBowl(): Promise<void> {
    try {
      // Load and cache tank texture based on size
      const isBowl = this.tank.size === 'BOWL'
      const textureSource = isBowl ? fishbowlSvg : recttankSvg
      const texture = await this.loadTankTexture(textureSource)

      this.bowlSprite = new Sprite(texture)

      // Position bowl/tank at center of tank container
      this.bowlSprite.anchor.set(0.5, 0.5)
      this.bowlSprite.x = this.tank.geometry.width / 2
      this.bowlSprite.y = this.tank.geometry.height / 2

      // Scale to fit tank (dynamically based on texture size)
      const scale = Math.min(
        this.tank.geometry.width / this.bowlSprite.texture.width,
        this.tank.geometry.height / this.bowlSprite.texture.height
      )
      this.bowlSprite.scale.set(scale)

      this.addChild(this.bowlSprite)
    } catch (error) {
      console.error('Failed to load tank SVG:', error)
    }
  }

  private async loadTankTexture(source: string): Promise<Texture> {
    if (!TankContainer.textureCache.has(source)) {
      TankContainer.textureCache.set(source, Assets.load(source))
    }
    return TankContainer.textureCache.get(source)!
  }
}

export default TankContainer
