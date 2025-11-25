import { ITankLogic, ITankGeometry, TankSize, UUID, IFishLogic, IFloor } from './types'
import type { ITankShape } from './types/tankShape'
import { Fish } from './Fish'
import { getFloorConfig } from './types/floor'
import { BowlTankShape } from '../services/physics/shapes/BowlTankShape'
import { RectangularTankShape } from '../services/physics/shapes/RectangularTankShape'

import {
  resolveBoundaryCollision,
  resolveFishCollision,
  detectFishCollision,
} from '../services/physics/CollisionService'
import { PERCENTAGE_MAX } from '../lib/constants'
import { ISpawnBounds } from './types/tankShape'

export class Tank implements ITankLogic {
  id: UUID = crypto.randomUUID()
  private _size: TankSize = 'BOWL'
  capacity: number = 1
  waterQuality: number = PERCENTAGE_MAX
  pollution: number = 0
  hasFilter: boolean = false
  temperature: number = 24
  createdAt: number = Date.now()
  backgroundColor: number
  fish: Fish[] = [] // Implementation uses Fish[] but interface expects IFish[]
  geometry: ITankGeometry
  floor: IFloor
  shape: ITankShape

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
    this.floor = getFloorConfig(this._size, width, height)

    // Initialize shape based on tank type
    this.shape = this.createShape(width, height)
  }

  // Getter for size
  get size(): TankSize {
    return this._size
  }

  // Setter for size that updates shape and floor when size changes
  set size(newSize: TankSize) {
    if (newSize !== this._size) {
      this._size = newSize
      this.floor = getFloorConfig(this._size, this.geometry.width, this.geometry.height)
      this.shape = this.createShape(this.geometry.width, this.geometry.height)
    }
  }

  private createShape(width: number, height: number): ITankShape {
    const centerX = width / 2
    const centerY = height / 2

    // BOWL tanks use BowlTankShape with composite collision surfaces
    if (this._size === 'BOWL') {
      return new BowlTankShape(centerX, centerY, width, height)
    }

    // STANDARD and BIG tanks use rectangular collision surfaces
    return new RectangularTankShape(centerX, centerY, width, height)
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

  // Collision detection methods - delegated to shape
  checkBoundary(fish: IFishLogic): boolean {
    return this.shape.checkBoundary(fish)
  }

  resolveBoundary(fish: IFishLogic): void {
    this.shape.resolveBoundary(fish)
  }

  getSpawnBounds(): ISpawnBounds {
    return this.shape.getSpawnBounds()
  }
}
