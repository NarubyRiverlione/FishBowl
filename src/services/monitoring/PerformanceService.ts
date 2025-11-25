import { ITankLogic } from '../../models/types'
import { PERFORMANCE_LOG_INTERVAL_MS, MILLISECONDS_PER_SECOND, DEFAULT_FPS_FALLBACK } from '../../lib/constants'
import useGameStore from '../../store/useGameStore'

interface WindowWithDebug extends Window {
  __FISHBOWL_DEBUG_ENGINE__?: boolean
}

export class PerformanceService {
  private tank: ITankLogic
  private lastLogTime: number = 0

  constructor(tank: ITankLogic) {
    this.tank = tank
  }

  update(): void {
    // Only run performance monitoring in developer mode
    const isDeveloperMode = useGameStore.getState().developerMode
    if (!isDeveloperMode) return

    const now = performance.now()
    if (now - this.lastLogTime > PERFORMANCE_LOG_INTERVAL_MS) {
      const fps = this.lastLogTime ? MILLISECONDS_PER_SECOND / (now - this.lastLogTime) : DEFAULT_FPS_FALLBACK
      const fishCount = this.tank.fish.length
      const checks = this.tank.collisionChecks
      const collisions = this.tank.collisionsResolved

      // Performance logging - only in developer mode
      console.log(`FPS: ${fps.toFixed(1)} | Fish: ${fishCount} | Checks: ${checks} | Collisions: ${collisions}`)
      this.lastLogTime = now
    }
  }

  /**
   * Log engine lifecycle events for debugging.
   * Called when engine is created, destroyed, or assigned to a tank.
   */
  static logEngineLifecycle(event: 'created' | 'destroyed' | 'tank_assigned', engineId: string, tankId?: string): void {
    if (typeof window !== 'undefined' && (window as WindowWithDebug).__FISHBOWL_DEBUG_ENGINE__) {
      const message = `[EngineLifecycle] ${event.toUpperCase()}: Engine=${engineId}${tankId ? ` Tank=${tankId}` : ''}`
      console.log(message)
    }
  }

  /**
   * Get engine instance count and status for monitoring.
   */
  static getEngineStats(): {
    debug_enabled: boolean
    timestamp: number
  } {
    return {
      debug_enabled:
        typeof window !== 'undefined' ? ((window as WindowWithDebug).__FISHBOWL_DEBUG_ENGINE__ ?? false) : false,
      timestamp: Date.now(),
    }
  }
}

export default PerformanceService
