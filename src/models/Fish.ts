import { IFish } from '../types/fish'
import { updateVelocity, calculateAcceleration } from '../lib/physics'
import {
  FISH_BASE_SIZE,
  FISH_BASE_RADIUS,
  FISH_BASE_MASS,
  FISH_FRICTION,
  SWIM_DIRECTION_CHANGE_PROBABILITY,
  SWIM_DIRECTION_CHANGE_FORCE,
  SWIM_MIN_SPEED,
  SWIM_BOOST_FORCE,
} from '../lib/constants'

export class Fish implements IFish {
  id: string
  x: number
  y: number
  vx: number = 0
  vy: number = 0
  ax: number = 0
  ay: number = 0
  scale: number = 1
  color: string = '#FFFFFF'
  width: number = FISH_BASE_SIZE
  height: number = FISH_BASE_SIZE
  mass: number = FISH_BASE_MASS
  radius: number = FISH_BASE_RADIUS
  friction: number = FISH_FRICTION

  constructor(id: string, x: number, y: number, color: string = '#FFFFFF', scale: number = 1) {
    this.id = id
    this.x = x
    this.y = y
    this.color = color
    this.scale = scale

    // Adjust physical properties based on scale
    this.radius = FISH_BASE_RADIUS * scale
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
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    if (speed < SWIM_MIN_SPEED) {
      const angle = Math.random() * Math.PI * 2
      const force = SWIM_BOOST_FORCE * this.mass
      this.applyForce(Math.cos(angle) * force, Math.sin(angle) * force)
    }
  }

  update(delta: number): void {
    // Apply swim forces
    this.swim()

    // Update velocity
    this.vx = updateVelocity(this.vx, this.ax, this.friction)
    this.vy = updateVelocity(this.vy, this.ay, this.friction)

    // Update position
    this.x += this.vx * delta
    this.y += this.vy * delta

    // Reset acceleration
    this.ax = 0
    this.ay = 0
  }
}
