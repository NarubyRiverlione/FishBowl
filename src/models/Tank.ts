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
    return (
      fish.geometry.position.x - fish.geometry.radius <= 0 ||
      fish.geometry.position.x + fish.geometry.radius >= this.geometry.width ||
      fish.geometry.position.y - fish.geometry.radius <= 0 ||
      fish.geometry.position.y + fish.geometry.radius >= this.geometry.height
    )
  }

  resolveBoundary(fish: IFishLogic): void {
    // Handle boundary collisions
    if (fish.geometry.position.x - fish.geometry.radius <= 0) {
      fish.geometry.position.x = fish.geometry.radius
      fish.geometry.velocity.vx = -fish.geometry.velocity.vx
    }
    if (fish.geometry.position.x + fish.geometry.radius >= this.geometry.width) {
      fish.geometry.position.x = this.geometry.width - fish.geometry.radius
      fish.geometry.velocity.vx = -fish.geometry.velocity.vx
    }
    if (fish.geometry.position.y - fish.geometry.radius <= 0) {
      fish.geometry.position.y = fish.geometry.radius
      fish.geometry.velocity.vy = -fish.geometry.velocity.vy
    }
    if (fish.geometry.position.y + fish.geometry.radius >= this.geometry.height) {
      fish.geometry.position.y = this.geometry.height - fish.geometry.radius
      fish.geometry.velocity.vy = -fish.geometry.velocity.vy
    }
  }

  getSpawnBounds(): ISpawnBounds {
    return {
      minX: 20,
      maxX: this.geometry.width - 20,
      minY: 20,
      maxY: this.geometry.height - 20,
    }
  }
}
