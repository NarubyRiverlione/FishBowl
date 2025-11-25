import { Application } from 'pixi.js'
import { Tank } from '../../models/Tank'
import { TankContainer } from '../views/TankContainer'
import { FishController } from '../controllers/FishController'
import { PerformanceMonitor } from '../PerformanceMonitor'
import { IFishData, ITankData } from '../../models/types'
import useGameStore from '../../store/useGameStore'

export class RenderingEngine {
  private app: Application
  public tank: Tank // Public for testing/inspection - synced with store
  public tankView: TankContainer // Public for resize handling
  private fishManager: FishController
  private performanceMonitor: PerformanceMonitor
  private isInitialized: boolean = false
  private isDestroyed: boolean = false
  private storeUnsubscribe: (() => void) | null = null

  constructor(width: number, height: number, backgroundColor: number) {
    this.app = new Application()

    // Get initial tank data from store
    const initialState = useGameStore.getState()
    const storeTank = initialState.tank

    if (storeTank) {
      // Create Tank model with store dimensions from geometry
      this.tank = new Tank(storeTank.geometry.width, storeTank.geometry.height, storeTank.backgroundColor)
      // Immediately sync with store state
      this.syncTankProperties(storeTank)
    } else {
      // Fallback to constructor params if no store tank available
      this.tank = new Tank(width, height, backgroundColor)
    }

    this.tankView = new TankContainer(this.tank)
    this.fishManager = new FishController(this.tank, this.tankView)
    this.performanceMonitor = new PerformanceMonitor(this.tank)

    // Subscribe to store for reactive updates
    this.setupStoreSubscription()
  }

  /**
   * Syncs tank properties from Zustand store to Tank model instance.
   *
   * CRITICAL: Geometry must be updated BEFORE size.
   * The Tank.size setter triggers shape recreation using current geometry.
   * If geometry isn't up-to-date when size changes (e.g., BOWL→STANDARD upgrade),
   * shapes are created with stale dimensions (300x300 instead of 600x600).
   *
   * Data flow: Store (ITankData) → RenderingEngine → Tank model
   * Geometry is single source of truth from store; shapes receive it at construction.
   */
  private syncTankProperties(storeTank: ITankData): void {
    // Sync all tank properties from store to Tank model

    // Core tank properties
    this.tank.id = storeTank.id
    this.tank.createdAt = storeTank.createdAt
    this.tank.capacity = storeTank.capacity // Critical for fish population limits

    // Geometry (critical for positioning and sizing) - UPDATE BEFORE SIZE
    this.tank.geometry = { ...storeTank.geometry }

    // Size setter triggers shape recreation, must use updated geometry
    this.tank.size = storeTank.size // Critical for shape rendering (BOWL vs STANDARD)

    // Water and environment
    this.tank.waterQuality = storeTank.waterQuality
    this.tank.pollution = storeTank.pollution
    this.tank.hasFilter = storeTank.hasFilter // Critical for water quality calculations
    this.tank.temperature = storeTank.temperature

    // Visual properties
    this.tank.backgroundColor = storeTank.backgroundColor

    // Note: fish are synced separately via syncFish method
    // Note: metrics (collisionChecks, collisionsResolved) are Tank instance-specific
  }

  private setupStoreSubscription(): void {
    // Subscribe to store changes and sync the local Tank instance
    this.storeUnsubscribe = useGameStore.subscribe((state) => {
      this.syncWithStore(state.tank)
    })

    // Initial sync with current store state
    const currentStoreState = useGameStore.getState()
    this.syncWithStore(currentStoreState.tank)
  }

  private syncWithStore(storeTank: ITankData | null): void {
    if (!storeTank || this.isDestroyed) return

    try {
      // Sync tank properties from store
      this.syncTankProperties(storeTank)

      // Check if tank sprite needs to be recreated (e.g., tank upgrade from BOWL to STANDARD)
      // Then update display scale to match new tank dimensions
      void (async () => {
        await this.tankView.recreateTankSpriteIfNeeded()
        // Update display scale after sprite recreation to fit new tank size
        if (typeof this.tankView.updateDisplayScale === 'function') {
          this.tankView.updateDisplayScale()
        }
      })()

      // Sync fish using existing method
      this.syncFish(storeTank.fish)

      // Notify view components of the changes
      this.tankView.update()
    } catch (error) {
      console.warn('Error syncing RenderingEngine with store:', error)
    }
  }

  async init(element: HTMLElement): Promise<void> {
    if (this.isInitialized || this.isDestroyed) {
      return
    }

    try {
      // Initialize canvas to fill container
      const containerWidth = element.clientWidth || this.tank.geometry.width
      const containerHeight = element.clientHeight || this.tank.geometry.height

      await this.app.init({
        width: containerWidth,
        height: containerHeight,
        backgroundColor: 0x333333,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      })

      // Verify canvas creation
      if (!this.app.canvas) {
        throw new Error('Failed to create Pixi.js canvas')
      }

      // Append canvas to DOM
      element.appendChild(this.app.canvas)

      // Wait a frame to ensure stage is ready
      await new Promise((resolve) => requestAnimationFrame(resolve))

      // Verify stage is available
      if (!this.app.stage) {
        throw new Error('Pixi.js stage not available after initialization')
      }

      // Center tank view on canvas
      const canvasWidth = this.app.screen.width
      const canvasHeight = this.app.screen.height

      // Account for the scale of the tank view when centering
      const scale = this.tankView.scale.x
      const tankWidth = this.tank.geometry.width * scale
      const tankHeight = this.tank.geometry.height * scale

      this.tankView.x = (canvasWidth - tankWidth) / 2
      this.tankView.y = (canvasHeight - tankHeight) / 2

      // Add tank view to stage
      this.app.stage.addChild(this.tankView)

      // Start the game loop
      this.app.ticker.add((ticker) => {
        if (!this.isDestroyed) {
          this.update(ticker.deltaTime)
        }
      })

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize RenderingEngine:', error)
      this.destroy()
      throw error
    }
  }

  spawnFish(amountNewFish: number): void {
    this.fishManager.spawn(amountNewFish)
  }

  resizeCanvas(newWidth: number, newHeight: number): void {
    if (this.app && this.app.renderer) {
      this.app.renderer.resize(newWidth, newHeight)
    }
  }

  syncFish(fish: IFishData[]): void {
    // console.log('🎯 RenderingEngine.syncFish called with:', fish.length, 'fish')
    // console.log(
    //   '🔍 Fish details:',
    //   fish.map((f) => ({ id: f.id, species: f.species, age: f.age }))
    // )
    // Record diagnostic info when test helpers are enabled, but do not let errors escape.
    try {
      const helpers = (
        globalThis as typeof globalThis & {
          __TEST_HELPERS__?: {
            _lastSyncFishCount?: number
            _lastSyncTimestamp?: number
          }
        }
      ).__TEST_HELPERS__
      if (helpers) {
        try {
          helpers._lastSyncFishCount = fish?.length ?? 0
          helpers._lastSyncTimestamp = Date.now()
        } catch {
          // ignore diagnostics failures
        }
      }
    } catch {
      // ignore
    }

    this.fishManager.syncFish(fish)
    // console.log('✅ RenderingEngine sync completed')
  }

  // Expose fish positions in stage coordinates (useful for deterministic tests)
  getFishScreenPositions(): Array<{ id: string; x: number; y: number }> {
    try {
      if (
        this.tankView &&
        'getFishScreenPositions' in this.tankView &&
        typeof this.tankView.getFishScreenPositions === 'function'
      ) {
        return this.tankView.getFishScreenPositions()
      }
    } catch {
      // ignore
    }
    return []
  }

  // Wait until the rendering layer reports at least one fish position.
  // Useful for deterministic e2e tests that need to know when sprites are present.
  async waitForFishRendered(timeout = 5000, pollInterval = 100): Promise<boolean> {
    const start = Date.now()
    // Quick path: check immediately
    try {
      const initial = this.getFishScreenPositions()
      if (initial && initial.length > 0) return true
    } catch {
      // ignore
    }

    while (Date.now() - start < timeout) {
      await new Promise((res) => setTimeout(res, pollInterval))
      try {
        const positions = this.getFishScreenPositions()
        if (positions && positions.length > 0) {
          return true
        }
      } catch {
        // ignore and retry
      }
    }

    return false
  }

  update(delta: number): void {
    // TODO: ARCHITECTURE CONCERN - Mixed responsibilities
    // See ARCHITECTURE_CONCERNS.md for detailed analysis
    // This method handles both game logic (tank.update) and rendering (tankView.update)
    // Future refactor should move game logic to store/game loop and keep only rendering here
    this.tank.update(delta)
    this.tankView.update()
    this.performanceMonitor.update()
  }

  destroy(): void {
    if (this.isDestroyed) {
      return
    }

    this.isDestroyed = true

    try {
      // Cleanup store subscription first
      if (this.storeUnsubscribe) {
        this.storeUnsubscribe()
        this.storeUnsubscribe = null
      }

      if (this.app) {
        // Store reference to app before potential destruction
        const app = this.app

        // Stop ticker if available
        if (app.ticker) {
          app.ticker.stop()
        }

        // Only try to cleanup canvas if it was actually created
        try {
          if (app.canvas && app.canvas.parentNode) {
            app.canvas.parentNode.removeChild(app.canvas)
          }
        } catch (canvasError) {
          // Canvas may not exist if app wasn't fully initialized
          console.warn('Canvas cleanup warning:', canvasError)
        }

        // Only destroy if the app has been properly initialized
        try {
          if (app.renderer) {
            app.destroy(true, { children: true })
          }
        } catch (destroyError) {
          // App may not be fully initialized
          console.warn('App destroy warning:', destroyError)
        }

        // Clear our reference
        this.app = null!
      }
    } catch (error) {
      console.warn('Error during RenderingEngine cleanup:', error)
    }
  }
}
