// Tank debugging utility for Phase 4 development (T040a)

import { type ITankData } from '../../models/types'

export interface TankDebugInfo {
  tankId: string
  fishCount: number
  livingFishCount: number
  waterQuality: number
  pollution: number
  hasFilter: boolean
  capacity: number
  collisionChecks?: number
  renderingEngineId?: string
}

export class TankDebugger {
  private static collisionCheckCount = 0
  private static enabled = false

  /**
   * Enable/disable debugging mode
   */
  static setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (enabled) {
      console.log('🐠 TankDebugger: Debugging enabled')
    }
  }

  /**
   * Log tank state information - works with store data
   */
  static logTankState(tank: ITankData, prefix = ''): void {
    if (!this.enabled) return

    const debugInfo: TankDebugInfo = {
      tankId: tank.id.substring(0, 8), // Short ID for readability
      fishCount: tank.fish.length,
      livingFishCount: tank.fish.filter((f) => f.isAlive).length,
      waterQuality: tank.waterQuality,
      pollution: tank.pollution,
      hasFilter: tank.hasFilter,
      capacity: tank.capacity,
    }

    console.log(`🏊 ${prefix}Tank State:`, debugInfo)
  }

  /**
   * Log collision check events
   */
  static logCollisionCheck(fishId: string, tankId: string): void {
    if (!this.enabled) return

    this.collisionCheckCount++
    if (this.collisionCheckCount % 10 === 0) {
      console.log(
        `💥 Collision checks: ${this.collisionCheckCount} (last: fish ${fishId.substring(0, 8)} in tank ${tankId.substring(0, 8)})`
      )
    }
  }

  /**
   * Log rendering engine status
   */
  static logRenderingEngine(engineId: string, action: 'created' | 'destroyed' | 'assigned', tankId?: string): void {
    if (!this.enabled) return

    const message = tankId
      ? `🎮 RenderingEngine ${engineId.substring(0, 8)} ${action} for tank ${tankId.substring(0, 8)}`
      : `🎮 RenderingEngine ${engineId.substring(0, 8)} ${action}`

    console.log(message)
  }

  /**
   * Get current debugging statistics
   */
  static getStats(): Record<string, number> {
    return {
      collisionChecks: this.collisionCheckCount,
    }
  }

  /**
   * Reset debugging statistics
   */
  static resetStats(): void {
    this.collisionCheckCount = 0
    if (this.enabled) {
      console.log('📊 TankDebugger: Statistics reset')
    }
  }

  /**
   * Validate tank consistency - works with store data
   */
  static validateTank(tank: ITankData): string[] {
    const issues: string[] = []

    // Check fish count vs capacity
    if (tank.fish.length > tank.capacity) {
      issues.push(`Fish count (${tank.fish.length}) exceeds capacity (${tank.capacity})`)
    }

    // Check for dead fish that should be removed
    const deadFish = tank.fish.filter((f) => !f.isAlive)
    if (deadFish.length > 0) {
      issues.push(`Found ${deadFish.length} dead fish that should be cleaned up`)
    }

    // Check water quality consistency
    const expectedWaterQuality = Math.max(0, Math.min(100, 100 - tank.pollution))
    if (Math.abs(tank.waterQuality - expectedWaterQuality) > 1) {
      issues.push(`Water quality inconsistency: expected ${expectedWaterQuality}, got ${tank.waterQuality}`)
    }

    // Check filter logic for BOWL tanks
    if (tank.size === 'BOWL' && tank.hasFilter) {
      issues.push('BOWL tank should not have a filter')
    }

    if (this.enabled && issues.length > 0) {
      console.warn(`⚠️ Tank validation issues for ${tank.id}:`, issues)
    }

    return issues
  }
}
