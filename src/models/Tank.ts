import { ITank } from './types/tank'
import { IFish } from './types/fish'
import {
  resolveBoundaryCollision,
  resolveFishCollision,
  detectFishCollision,
} from '../services/physics/CollisionService'

export class Tank implements ITank {
  width: number
  height: number
  backgroundColor: number
  fish: IFish[] = []

  // Metrics
  collisionChecks: number = 0
  collisionsResolved: number = 0

  constructor(width: number, height: number, backgroundColor: number) {
    this.width = width
    this.height = height
    this.backgroundColor = backgroundColor
  }

  addFish(fish: IFish): void {
    this.fish.push(fish)
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
}
