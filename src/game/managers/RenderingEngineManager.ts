import { RenderingEngine } from '../engine/RenderingEngine'

interface WindowWithDebug extends Window {
  __FISHBOWL_DEBUG_ENGINE__?: boolean
}

/**
 * Singleton pattern for RenderingEngine to prevent multiple instances.
 * Ensures proper cleanup and lifecycle management.
 */
export class RenderingEngineManager {
  private static instance: RenderingEngine | null = null
  private static instanceId: string | null = null
  private static instanceCount: number = 0
  private static lastWidth: number = 0
  private static lastHeight: number = 0
  private static lastBgColor: number = 0

  /**
   * Create or return the current RenderingEngine instance.
   * If dimensions or color differ from the current instance, the old one is destroyed and replaced.
   */
  static getInstance(width: number, height: number, backgroundColor: number): RenderingEngine {
    // If instance exists with same dimensions and color, return it
    if (
      this.instance !== null &&
      this.lastWidth === width &&
      this.lastHeight === height &&
      this.lastBgColor === backgroundColor
    ) {
      return this.instance
    }

    // Destroy previous instance if it exists (dimensions/color changed)
    if (this.instance !== null) {
      this.logDebug(`Destroying previous engine instance ${this.instanceId}`)
      try {
        this.instance.destroy()
      } catch (error) {
        console.warn('Error destroying previous RenderingEngine instance:', error)
      }
      this.instance = null
    }

    // Create new instance
    this.instanceCount += 1
    this.instanceId = `engine-${Date.now()}-${this.instanceCount}`
    this.instance = new RenderingEngine(width, height, backgroundColor)
    this.lastWidth = width
    this.lastHeight = height
    this.lastBgColor = backgroundColor

    this.logDebug(`Created new engine instance ${this.instanceId}`)

    return this.instance
  }

  /**
   * Get the current instance without creating a new one.
   */
  static getCurrentInstance(): RenderingEngine | null {
    return this.instance
  }

  /**
   * Get the ID of the current instance.
   */
  static getCurrentInstanceId(): string | null {
    return this.instanceId
  }

  /**
   * Check if there is an active instance.
   */
  static hasActiveInstance(): boolean {
    return this.instance !== null
  }

  /**
   * Destroy the current instance and clean up.
   */
  static destroyInstance(): void {
    if (this.instance !== null) {
      this.logDebug(`Destroying engine instance ${this.instanceId}`)
      try {
        this.instance.destroy()
      } catch (error) {
        console.warn('Error destroying RenderingEngine instance:', error)
      }
      this.instance = null
      this.instanceId = null
      this.lastWidth = 0
      this.lastHeight = 0
      this.lastBgColor = 0
    }
  }

  /**
   * Reset the singleton (for testing purposes).
   */
  static reset(): void {
    this.destroyInstance()
    this.instanceId = null
    this.instanceCount = 0
    this.lastWidth = 0
    this.lastHeight = 0
    this.lastBgColor = 0
  }

  /**
   * Get instance statistics for debugging.
   */
  static getInstanceStats(): {
    hasInstance: boolean
    instanceId: string | null
    totalInstancesCreated: number
  } {
    return {
      hasInstance: this.instance !== null,
      instanceId: this.instanceId,
      totalInstancesCreated: this.instanceCount,
    }
  }

  private static logDebug(message: string): void {
    if (typeof window !== 'undefined' && (window as WindowWithDebug).__FISHBOWL_DEBUG_ENGINE__) {
      console.log(`[RenderingEngineManager] ${message}`)
    }
  }
}
