import { Container, Graphics } from 'pixi.js'
import { ITankLogic, IFish } from '../../models/types'
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
  TANK_DISPLAY_MIN_SIZE,
  TANK_DISPLAY_MAX_SIZE,
  MOBILE_BREAKPOINT,
  DESKTOP_BREAKPOINT,
} from '../../lib/constants'
import useGameStore from '../../store/useGameStore'

export class TankContainer extends Container {
  private tank: ITankLogic
  private background: Graphics
  private fishSprites: Map<string, FishSprite> = new Map()
  private displayScale: number = 1

  constructor(tank: ITankLogic) {
    super()
    this.tank = tank
    this.background = new Graphics()
    this.addChild(this.background)
    this.calculateDisplayScale()
    this.draw()
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

  addFish(fish: IFish): void {
    // console.log('🏠 TankContainer.addFish called for:', fish.id, 'Tank size:', this.tank.geometry.width, 'x', this.tank.geometry.height)
    // Generate random initial position within tank bounds, below water line
    const tankWidth = this.tank.geometry.width || TANK_DEFAULT_WIDTH
    const tankHeight = this.tank.geometry.height || TANK_DEFAULT_HEIGHT
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

  private draw(): void {
    this.background.clear()

    const waterLevel = this.tank.geometry.height * WATER_LEVEL

    // Use BOWL tank size to determine if circular rendering should be used
    if (this.tank.size === 'BOWL') {
      this.drawCircularTank(waterLevel)
    } else {
      // Fallback to rectangular rendering for STANDARD tanks
      this.drawRectangularTank(waterLevel)
    }
  }

  private drawCircularTank(waterLevel: number): void {
    const radius = Math.min(this.tank.geometry.width, this.tank.geometry.height) / 2
    const centerX = this.tank.geometry.centerX
    const centerY = this.tank.geometry.centerY

    // Draw water (circular filled portion)
    // For circular tanks, we need to create a clipped water area
    this.background.circle(centerX, centerY, radius - TANK_BORDER_WIDTH / 2)
    this.background.fill(this.tank.backgroundColor)

    // Draw tank border (circular outline)
    this.background.circle(centerX, centerY, radius)
    this.background.stroke({ width: TANK_BORDER_WIDTH, color: TANK_BORDER_COLOR })

    // Draw water surface line (horizontal chord across the circle)
    // Calculate water surface position using the actual waterLevel
    const surfaceY = this.tank.geometry.height - waterLevel

    // Only draw surface line if it intersects with the circle
    if (surfaceY >= centerY - radius && surfaceY <= centerY + radius) {
      const distanceFromCenter = Math.abs(centerY - surfaceY)
      const chordHalfWidth = Math.sqrt(Math.pow(radius, 2) - Math.pow(distanceFromCenter, 2))
      const chordStartX = centerX - chordHalfWidth
      const chordEndX = centerX + chordHalfWidth

      this.background
        .moveTo(chordStartX, surfaceY)
        .lineTo(chordEndX, surfaceY)
        .stroke({ width: WATER_SURFACE_WIDTH, color: WATER_SURFACE_COLOR, alpha: WATER_SURFACE_ALPHA })
    }
  }

  private drawRectangularTank(waterLevel: number): void {
    // Draw water (filled portion)
    this.background.rect(0, this.tank.geometry.height - waterLevel, this.tank.geometry.width, waterLevel)
    this.background.fill(this.tank.backgroundColor)

    // Draw tank walls (bottom and sides only, no top)
    this.background.rect(0, 0, this.tank.geometry.width, this.tank.geometry.height)
    this.background.stroke({ width: TANK_BORDER_WIDTH, color: TANK_BORDER_COLOR })

    // Draw water surface line
    this.background
      .moveTo(0, this.tank.geometry.height - waterLevel)
      .lineTo(this.tank.geometry.width, this.tank.geometry.height - waterLevel)
      .stroke({ width: WATER_SURFACE_WIDTH, color: WATER_SURFACE_COLOR, alpha: WATER_SURFACE_ALPHA })
  }
}

export default TankContainer
