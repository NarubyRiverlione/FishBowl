import { Application } from 'pixi.js'
import { Tank } from '../models/Tank'
import { TankContainer } from './views/TankContainer'
import { FishController } from './controllers/FishController'
import { PerformanceMonitor } from './PerformanceMonitor'
import { IFish } from '../models/types'

export class RenderingEngine {
  private app: Application
  public tank: Tank // Public for testing/inspection
  private tankView: TankContainer
  private fishManager: FishController
  private performanceMonitor: PerformanceMonitor
  private isInitialized: boolean = false
  private isDestroyed: boolean = false

  constructor(width: number, height: number, backgroundColor: number) {
    this.app = new Application()
    this.tank = new Tank(width, height, backgroundColor)
    this.tankView = new TankContainer(this.tank)
    this.fishManager = new FishController(this.tank, this.tankView)
    this.performanceMonitor = new PerformanceMonitor(this.tank)
  }

  async init(element: HTMLElement): Promise<void> {
    if (this.isInitialized || this.isDestroyed) {
      return
    }

    try {
      await this.app.init({
        width: this.tank.width,
        height: this.tank.height,
        backgroundColor: 0x333333,
        antialias: true,
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

  syncFish(fish: IFish[]): void {
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
      if (this.app) {
        // Store reference to app before potential destruction
        const app = this.app

        // Stop ticker if available
        if (app.ticker) {
          app.ticker.stop()
        }

        // Remove canvas from DOM if it exists and is valid
        try {
          if (app.canvas && app.canvas.parentNode) {
            app.canvas.parentNode.removeChild(app.canvas)
          }
        } catch (canvasError) {
          // Canvas may already be destroyed or invalid
          console.warn('Canvas cleanup warning:', canvasError)
        }

        // Destroy the application
        app.destroy(true, { children: true })

        // Clear our reference
        this.app = null as any
      }
    } catch (error) {
      console.warn('Error during RenderingEngine cleanup:', error)
    }
  }
}
