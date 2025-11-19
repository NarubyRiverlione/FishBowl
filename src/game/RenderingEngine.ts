import { Application } from 'pixi.js'
import { Tank } from '../models/Tank'
import { TankView } from './TankView'
import { Fish } from '../models/Fish'
import { randomColor, randomPosition, randomVelocity } from '../lib/random'

export class RenderingEngine {
  private app: Application
  public tank: Tank // Public for testing/inspection
  private tankView: TankView
  private isInitialized: boolean = false
  private isDestroyed: boolean = false

  constructor(width: number, height: number, backgroundColor: number) {
    this.app = new Application()
    this.tank = new Tank(width, height, backgroundColor)
    this.tankView = new TankView(this.tank)
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

  spawnFish(count: number): void {
    for (let i = 0; i < count; i++) {
      const id = Math.random().toString(36).substring(7)
      const x = randomPosition(0, this.tank.width)
      const y = randomPosition(0, this.tank.height)

      const fish = new Fish(id, x, y)
      fish.vx = randomVelocity(5)
      fish.vy = randomVelocity(5)
      fish.color = randomColor()

      this.tank.addFish(fish)
      this.tankView.addFish(fish)
    }
  }

  update(delta: number): void {
    this.tank.update(delta)
    this.tankView.update()
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
