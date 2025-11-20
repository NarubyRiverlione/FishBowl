import { Tank } from '../../models/Tank'

export class PerformanceService {
  private tank: Tank
  private lastLogTime: number = 0

  constructor(tank: Tank) {
    this.tank = tank
  }

  update(): void {
    const now = performance.now()
    if (now - this.lastLogTime > 1000) {
      const fps = this.lastLogTime ? 1000 / (now - this.lastLogTime) : 60
      const fishCount = this.tank.fish.length
      const checks = this.tank.collisionChecks
      const collisions = this.tank.collisionsResolved

      console.log(`FPS: ${fps.toFixed(1)} | Fish: ${fishCount} | Checks: ${checks} | Collisions: ${collisions}`)
      this.lastLogTime = now
    }
  }
}

export default PerformanceService
