import { ITankLogic, ITankGeometry, TankSize, UUID, IFishLogic } from './types'
import { Fish } from './Fish'
import {
  resolveBoundaryCollision,
  resolveFishCollision,
  detectFishCollision,
} from '../services/physics/CollisionService'
import { PERCENTAGE_MAX } from '../lib/constants'
import { ISpawnBounds } from './types/tankShape'

export class Tank implements ITankLogic {
  id: UUID = crypto.randomUUID()
  size: TankSize = 'BOWL'
  capacity: number = 1
  waterQuality: number = PERCENTAGE_MAX
  pollution: number = 0
  hasFilter: boolean = false
  temperature: number = 24
  createdAt: number = Date.now()
  backgroundColor: number
  fish: Fish[] = [] // Implementation uses Fish[] but interface expects IFish[]
  geometry: ITankGeometry

  // Metrics
  collisionChecks: number = 0
  collisionsResolved: number = 0

  constructor(width: number, height: number, backgroundColor: number) {
    this.geometry = {
      width,
      height,
      centerX: width / 2,
      centerY: height / 2,
    }
    this.backgroundColor = backgroundColor
  }

  addFish(fish: IFishLogic): void {
    // Accept IFishLogic but internally we work with Fish instances
    if (fish instanceof Fish) {
      this.fish.push(fish)
    } else {
      // Convert IFishLogic to Fish if needed
      const fishInstance = new Fish(fish.id, fish.geometry.position.x, fish.geometry.position.y, fish.color, fish.size)
      fishInstance.species = fish.species
      fishInstance.age = fish.age
      fishInstance.health = fish.health
      fishInstance.hunger = fish.hunger
      fishInstance.isAlive = fish.isAlive
      fishInstance.genetics = fish.genetics
      fishInstance.createdAt = fish.createdAt
      fishInstance.lastFedAt = fish.lastFedAt
      fishInstance.geometry.velocity.vx = fish.geometry.velocity.vx
      fishInstance.geometry.velocity.vy = fish.geometry.velocity.vy
      fishInstance.geometry.radius = fish.geometry.radius
      this.fish.push(fishInstance)
    }
  }

  removeFish(fishId: string): void {
    this.fish = this.fish.filter((f) => f.id !== fishId)
  }

  update(delta: number): void {
    // Reset metrics for this frame
    this.collisionChecks = 0
    this.collisionsResolved = 0

    // Update each fish
    for (const fish of this.fish) {
      fish.update(delta)

      // Check boundary collisions
      resolveBoundaryCollision(fish, this)
    }

    // Check fish-to-fish collisions
    // O(n^2) - acceptable for small number of fish (20)
    for (let i = 0; i < this.fish.length; i++) {
      for (let j = i + 1; j < this.fish.length; j++) {
        const f1 = this.fish[i]
        const f2 = this.fish[j]

        this.collisionChecks++
        if (f1 && f2 && detectFishCollision(f1, f2)) {
          resolveFishCollision(f1, f2)
          this.collisionsResolved++
        }
      }
    }
  }

  // Collision detection methods required by ITankLogic
  checkBoundary(fish: IFishLogic): boolean {
    if (this.size === 'BOWL') {
      return this.checkBoundaryCircular(fish)
    }
    return this.checkBoundaryRectangular(fish)
  }

  private getRectangularMargins() {
    // Margins based on recttank.svg (100x100 viewBox)
    // Water x: 6-94 (6% margin)
    // Water y: 20-94 (20% top margin, 6% bottom margin)
    return {
      marginX: this.geometry.width * 0.06,
      waterTop: this.geometry.height * 0.2,
      waterBottom: this.geometry.height * 0.94,
    }
  }

  private checkBoundaryRectangular(fish: IFishLogic): boolean {
    const { marginX, waterTop, waterBottom } = this.getRectangularMargins()

    return (
      fish.geometry.position.x - fish.geometry.radius <= marginX ||
      fish.geometry.position.x + fish.geometry.radius >= this.geometry.width - marginX ||
      fish.geometry.position.y - fish.geometry.radius <= waterTop ||
      fish.geometry.position.y + fish.geometry.radius >= waterBottom
    )
  }

  private checkBoundaryCircular(fish: IFishLogic): boolean {
    const centerX = this.geometry.centerX
    const centerY = this.geometry.centerY
    const radius = Math.min(this.geometry.width, this.geometry.height) / 2
    const waterLevel = this.geometry.height * 0.95 // WATER_LEVEL constant

    // Check if above water surface
    if (fish.geometry.position.y - fish.geometry.radius < waterLevel - this.geometry.height) {
      return true
    }

    // Check if outside circular boundary
    const distanceFromCenter = Math.sqrt(
      Math.pow(fish.geometry.position.x - centerX, 2) + Math.pow(fish.geometry.position.y - centerY, 2)
    )
    return distanceFromCenter + fish.geometry.radius > radius
  }

  resolveBoundary(fish: IFishLogic): void {
    if (this.size === 'BOWL') {
      this.resolveBoundaryCircular(fish)
    } else {
      this.resolveBoundaryRectangular(fish)
    }
  }

  private resolveBoundaryRectangular(fish: IFishLogic): void {
    const { marginX, waterTop, waterBottom } = this.getRectangularMargins()

    // Handle boundary collisions
    if (fish.geometry.position.x - fish.geometry.radius <= marginX) {
      fish.geometry.position.x = marginX + fish.geometry.radius
      fish.geometry.velocity.vx = Math.abs(fish.geometry.velocity.vx) // Bounce right
    }
    if (fish.geometry.position.x + fish.geometry.radius >= this.geometry.width - marginX) {
      fish.geometry.position.x = this.geometry.width - marginX - fish.geometry.radius
      fish.geometry.velocity.vx = -Math.abs(fish.geometry.velocity.vx) // Bounce left
    }
    if (fish.geometry.position.y - fish.geometry.radius <= waterTop) {
      fish.geometry.position.y = waterTop + fish.geometry.radius
      fish.geometry.velocity.vy = Math.abs(fish.geometry.velocity.vy) // Bounce down
    }
    if (fish.geometry.position.y + fish.geometry.radius >= waterBottom) {
      fish.geometry.position.y = waterBottom - fish.geometry.radius
      fish.geometry.velocity.vy = -Math.abs(fish.geometry.velocity.vy) // Bounce up
    }
  }

  private resolveBoundaryCircular(fish: IFishLogic): void {
    const centerX = this.geometry.centerX
    const centerY = this.geometry.centerY
    const radius = Math.min(this.geometry.width, this.geometry.height) / 2
    const waterLevel = this.geometry.height * 0.95 // WATER_LEVEL constant
    const waterTop = this.geometry.height - waterLevel

    // Check if above water surface (hard ceiling)
    if (fish.geometry.position.y - fish.geometry.radius < waterTop) {
      fish.geometry.position.y = waterTop + fish.geometry.radius
      fish.geometry.velocity.vy = Math.abs(fish.geometry.velocity.vy) // Force downward
    }

    // Check circular boundary collision
    const distanceFromCenter = Math.sqrt(
      Math.pow(fish.geometry.position.x - centerX, 2) + Math.pow(fish.geometry.position.y - centerY, 2)
    )

    if (distanceFromCenter + fish.geometry.radius > radius) {
      // Push fish back inside the circle
      const angle = Math.atan2(fish.geometry.position.y - centerY, fish.geometry.position.x - centerX)
      fish.geometry.position.x = centerX + Math.cos(angle) * (radius - fish.geometry.radius)
      fish.geometry.position.y = centerY + Math.sin(angle) * (radius - fish.geometry.radius)

      // Reflect velocity off the circular boundary
      const vx = fish.geometry.velocity.vx
      const vy = fish.geometry.velocity.vy
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)

      // Reflect: v_new = v - 2(v·n)n, where n is the normal
      const dotProduct = vx * cos + vy * sin
      fish.geometry.velocity.vx = vx - 2 * dotProduct * cos
      fish.geometry.velocity.vy = vy - 2 * dotProduct * sin
    }
  }

  getSpawnBounds(): ISpawnBounds {
    if (this.size === 'BOWL') {
      // For circular tanks, spawn within the circle and below water line
      const radius = Math.min(this.geometry.width, this.geometry.height) / 2
      const safeMargin = 30 // Keep fish away from edges
      const waterLevel = this.geometry.height * 0.95
      const waterTop = this.geometry.height - waterLevel

      return {
        minX: this.geometry.centerX - (radius - safeMargin),
        maxX: this.geometry.centerX + (radius - safeMargin),
        minY: Math.max(waterTop + safeMargin, 20),
        maxY: this.geometry.height - safeMargin,
      }
    }

    // Rectangular spawn bounds
    const { marginX, waterTop, waterBottom } = this.getRectangularMargins()
    const safeMargin = 20 // Additional safety margin for spawning

    return {
      minX: marginX + safeMargin,
      maxX: this.geometry.width - marginX - safeMargin,
      minY: waterTop + safeMargin,
      maxY: waterBottom - safeMargin,
    }
  }
}
