import { Tank } from '../../models/Tank'

import { PERFORMANCE_LOG_INTERVAL_MS, MILLISECONDS_PER_SECOND, DEFAULT_FPS_FALLBACK } from '../../lib/constants'

export class PerformanceService {
  private tank: Tank
  private lastLogTime: number = 0

  constructor(tank: Tank) {
    this.tank = tank
  }

  update(): void {
    const now = performance.now()
    if (now - this.lastLogTime > PERFORMANCE_LOG_INTERVAL_MS) {
      const fps = this.lastLogTime ? MILLISECONDS_PER_SECOND / (now - this.lastLogTime) : DEFAULT_FPS_FALLBACK
      const fishCount = this.tank.fish.length
      const checks = this.tank.collisionChecks
      const collisions = this.tank.collisionsResolved

      // Performance logging - keep enabled so tests observing metrics can verify behavior
      console.log(`FPS: ${fps.toFixed(1)} | Fish: ${fishCount} | Checks: ${checks} | Collisions: ${collisions}`)
      this.lastLogTime = now
    }
  }
}

export default PerformanceService
