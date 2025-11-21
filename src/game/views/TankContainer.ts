import { Container, Graphics } from 'pixi.js'
import { ITank, IFish } from '../../models/types'
import { FishSprite } from './FishSprite'
import {
  WATER_LEVEL,
  TANK_DEFAULT_WIDTH,
  TANK_DEFAULT_HEIGHT,
  FISH_SPAWN_POSITION_BUFFER,
  TANK_BORDER_WIDTH,
  TANK_BORDER_COLOR,
  WATER_SURFACE_WIDTH,
  WATER_SURFACE_COLOR,
  WATER_SURFACE_ALPHA,
} from '../../lib/constants'
import useGameStore from '../../store/useGameStore'

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
    // Allow clicking on empty tank area to clear selection
    this.interactive = true
    // Attach pointer handler defensively (tests may not provide Pixi event methods)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attach = (obj: any, ev: string, cb: (...args: any[]) => void) => {
      if (typeof obj.on === 'function') return obj.on(ev, cb)
      if (typeof obj.addEventListener === 'function') return obj.addEventListener(ev, cb)
      if (typeof obj.addListener === 'function') return obj.addListener(ev, cb)
      obj.__events = obj.__events || {}
      obj.__events[ev] = obj.__events[ev] || []
      obj.__events[ev].push(cb)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attach(this as any, 'pointerdown', (e: any) => {
      // If the click target is not a FishSprite, clear selection
      const target = e.target
      if (!(target instanceof FishSprite)) {
        useGameStore.getState().selectFish(null)
      }
    })
  }

  addFish(fish: IFish): void {
    // console.log('🏠 TankContainer.addFish called for:', fish.id, 'Tank size:', this.tank.width, 'x', this.tank.height)
    // Generate random initial position within tank bounds, below water line
    const tankWidth = this.tank.width || TANK_DEFAULT_WIDTH
    const tankHeight = this.tank.height || TANK_DEFAULT_HEIGHT
    const waterLevel = tankHeight * WATER_LEVEL
    const waterTop = tankHeight - waterLevel

    // Use effective radius that accounts for life stage scaling for safe positioning
    const effectiveRadius = fish.getEffectiveRadius ? fish.getEffectiveRadius() : fish.radius
    const safeMargin = effectiveRadius + FISH_SPAWN_POSITION_BUFFER // Extra buffer

    const minX = safeMargin
    const maxX = tankWidth - safeMargin
    const minY = waterTop + safeMargin
    const maxY = tankHeight - safeMargin

    const initialX = Math.random() * (maxX - minX) + minX
    // Position fish in water area only (below water line)
    const initialY = Math.random() * (maxY - minY) + minY

    // console.log('📍 Fish position calculated:', {
    //   initialX: initialX.toFixed(1),
    //   initialY: initialY.toFixed(1),
    //   waterTop: waterTop.toFixed(1),
    //   waterLevel: waterLevel.toFixed(1),
    //   effectiveRadius: effectiveRadius.toFixed(1),
    //   safeMargin: safeMargin.toFixed(1),
    // })

    const sprite = new FishSprite(fish, initialX, initialY)
    this.fishSprites.set(fish.id, sprite)
    this.addChild(sprite)
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

  private draw(): void {
    this.background.clear()

    const waterLevel = this.tank.height * WATER_LEVEL

    // Draw water (filled portion)
    this.background.rect(0, this.tank.height - waterLevel, this.tank.width, waterLevel)
    this.background.fill(this.tank.backgroundColor)

    // Draw tank walls (bottom and sides only, no top)
    this.background.rect(0, 0, this.tank.width, this.tank.height)
    this.background.stroke({ width: TANK_BORDER_WIDTH, color: TANK_BORDER_COLOR })

    // Draw water surface line
    this.background
      .moveTo(0, this.tank.height - waterLevel)
      .lineTo(this.tank.width, this.tank.height - waterLevel)
      .stroke({ width: WATER_SURFACE_WIDTH, color: WATER_SURFACE_COLOR, alpha: WATER_SURFACE_ALPHA })
  }
}

export default TankContainer
