import { IFishLogic, IFishGeometry, FishSpecies } from './types'
import { updateVelocity, calculateAcceleration } from '../services/physics/PhysicsService'
import {
  FISH_BASE_SIZE,
  FISH_BASE_RADIUS,
  FISH_BASE_MASS,
  FISH_FRICTION,
  SWIM_DIRECTION_CHANGE_PROBABILITY,
  SWIM_DIRECTION_CHANGE_FORCE,
  SWIM_MIN_SPEED,
  SWIM_BOOST_FORCE,
  FISH_AGE_YOUNG_MAX,
  FISH_AGE_MATURE_MAX,
  FISH_LIFE_STAGE_YOUNG_SCALE,
  FISH_LIFE_STAGE_MATURE_SCALE,
  FISH_LIFE_STAGE_OLD_SCALE,
  PERCENTAGE_MAX,
} from '../lib/constants'

export class Fish implements IFishLogic {
  id: string
  species: FishSpecies = FishSpecies.GUPPY
  size: number = 1.0
  age: number = 0
  health: number = PERCENTAGE_MAX
  hunger: number = 0
  isAlive: boolean = true
  genetics: Record<string, unknown> = {}
  createdAt: number = Date.now()
  lastFedAt?: number
  name?: string
  color: string = '#FFFFFF'

  // Geometry composition - single source of truth for position/physics
  geometry: IFishGeometry

  // Legacy properties for backward compatibility (getters/setters)
  get x(): number {
    return this.geometry.position.x
  }
  set x(value: number) {
    this.geometry.position.x = value
  }
  get y(): number {
    return this.geometry.position.y
  }
  set y(value: number) {
    this.geometry.position.y = value
  }
  get vx(): number {
    return this.geometry.velocity.vx
  }
  set vx(value: number) {
    this.geometry.velocity.vx = value
  }
  get vy(): number {
    return this.geometry.velocity.vy
  }
  set vy(value: number) {
    this.geometry.velocity.vy = value
  }
  get radius(): number {
    return this.geometry.radius
  }
  set radius(value: number) {
    this.geometry.radius = value
  }

  // Additional Fish-specific properties
  ax: number = 0
  ay: number = 0
  scale: number = 1
  width: number = FISH_BASE_SIZE
  height: number = FISH_BASE_SIZE
  mass: number = FISH_BASE_MASS
  friction: number = FISH_FRICTION

  constructor(id: string, x: number, y: number, color: string = '#FFFFFF', scale: number = 1) {
    this.id = id
    this.color = color
    this.scale = scale
    this.size = scale // Sync size with scale

    // Initialize geometry composition
    this.geometry = {
      position: { x, y },
      velocity: { vx: 0, vy: 0 },
      radius: FISH_BASE_RADIUS * scale,
    }

    // Adjust physical properties based on scale
    this.mass = FISH_BASE_MASS * scale
    this.width = FISH_BASE_SIZE * scale
    this.height = FISH_BASE_SIZE * scale
    this.friction = FISH_FRICTION
  }

  applyForce(fx: number, fy: number): void {
    this.ax += calculateAcceleration(fx, this.mass)
    this.ay += calculateAcceleration(fy, this.mass)
  }

  swim(): void {
    // Randomly change direction slightly
    if (Math.random() < SWIM_DIRECTION_CHANGE_PROBABILITY) {
      const angle = Math.random() * Math.PI * 2
      const force = SWIM_DIRECTION_CHANGE_FORCE * this.mass
      this.applyForce(Math.cos(angle) * force, Math.sin(angle) * force)
    }

    // If moving too slow, give a boost
    const speed = Math.sqrt(
      this.geometry.velocity.vx * this.geometry.velocity.vx + this.geometry.velocity.vy * this.geometry.velocity.vy
    )
    if (speed < SWIM_MIN_SPEED) {
      const angle = Math.random() * Math.PI * 2
      const force = SWIM_BOOST_FORCE * this.mass
      this.applyForce(Math.cos(angle) * force, Math.sin(angle) * force)
    }
  }

  /**
   * Get the effective collision radius including life stage scaling
   * @returns Radius accounting for both base scale and life stage multiplier
   */
  getEffectiveRadius(): number {
    const lifeStage = this.getLifeStage()
    const lifeStageMult = this.getLifeStageSizeMultiplier(lifeStage)
    return this.geometry.radius * lifeStageMult
  }

  /**
   * Get the life stage based on fish age
   * @returns Life stage: 'young', 'mature', or 'old'
   */
  private getLifeStage(): 'young' | 'mature' | 'old' {
    if (this.age < FISH_AGE_YOUNG_MAX) return 'young'
    if (this.age < FISH_AGE_MATURE_MAX) return 'mature'
    return 'old'
  }

  /**
   * Get the size multiplier for life stage
   * @param lifeStage The life stage
   * @returns Size multiplier (1.0 for young, 1.3 for mature/old)
   */
  private getLifeStageSizeMultiplier(lifeStage: 'young' | 'mature' | 'old'): number {
    switch (lifeStage) {
      case 'young':
        return FISH_LIFE_STAGE_YOUNG_SCALE
      case 'mature':
        return FISH_LIFE_STAGE_MATURE_SCALE
      case 'old':
        return FISH_LIFE_STAGE_OLD_SCALE
      default:
        return FISH_LIFE_STAGE_YOUNG_SCALE
    }
  }

  update(delta: number): void {
    // Apply swim forces
    this.swim()

    // Update velocity using geometry
    this.geometry.velocity.vx = updateVelocity(this.geometry.velocity.vx, this.ax, this.friction)
    this.geometry.velocity.vy = updateVelocity(this.geometry.velocity.vy, this.ay, this.friction)

    // Update position using geometry
    this.geometry.position.x += this.geometry.velocity.vx * delta
    this.geometry.position.y += this.geometry.velocity.vy * delta

    // Reset acceleration
    this.ax = 0
    this.ay = 0
  }
}
