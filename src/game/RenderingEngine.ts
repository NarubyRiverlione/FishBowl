import { Application } from 'pixi.js'
import { Tank } from '../models/Tank'
import { TankContainer } from './views/TankContainer'
import { FishController } from './controllers/FishController'
import { PerformanceMonitor } from './PerformanceMonitor'

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
    console.log('RenderingEngine initialized with tank:', { width, height, backgroundColor })
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
      if (this.app && this.app.ticker) {
        // Stop ticker
        this.app.ticker.stop()

        // Remove canvas from DOM if it exists
        if (this.app.canvas && this.app.canvas.parentNode) {
          this.app.canvas.parentNode.removeChild(this.app.canvas)
        }

        // Destroy the application
        this.app.destroy(true, { children: true })
      } else if (this.app) {
        // If no ticker but app exists, try to destroy anyway
        if (this.app.canvas && this.app.canvas.parentNode) {
          this.app.canvas.parentNode.removeChild(this.app.canvas)
        }
        this.app.destroy(true, { children: true })
      }
    } catch (error) {
      console.warn('Error during RenderingEngine cleanup:', error)
    }
  }
}
