import { IFish } from '../types/fish'
import { updateVelocity, calculateAcceleration } from '../lib/physics'

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
  width: number = 32
  height: number = 32
  mass: number = 1
  radius: number = 16
  friction: number = 0.01

  constructor(id: string, x: number, y: number, color: string = '#FFFFFF', scale: number = 1) {
    this.id = id
    this.x = x
    this.y = y
    this.color = color
    this.scale = scale

    // Adjust physical properties based on scale
    this.radius = 16 * scale
    this.mass = 1 * scale
    this.width = 32 * scale
    this.height = 32 * scale
  }

  applyForce(fx: number, fy: number): void {
    this.ax += calculateAcceleration(fx, this.mass)
    this.ay += calculateAcceleration(fy, this.mass)
  }

  update(delta: number): void {
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
