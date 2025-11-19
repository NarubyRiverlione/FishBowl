/**
 * Represents the visual properties of a fish for the prototype.
 */
export interface IFish {
  /** Unique identifier for the fish */
  id: string

  /** Current X position in the tank (pixels) */
  x: number

  /** Current Y position in the tank (pixels) */
  y: number

  /** Horizontal velocity (pixels/frame) */
  vx: number

  /** Vertical velocity (pixels/frame) */
  vy: number

  /** Visual scale factor (0.5 to 1.5) */
  scale: number

  /** Hex color string (e.g., "#FF5733") */
  color: string

  /** Width of the fish sprite in pixels (before scale) */
  width: number

  /** Height of the fish sprite in pixels (before scale) */
  height: number

  /** Mass of the fish for physics calculations */
  mass: number

  /** Collision radius of the fish in pixels */
  radius: number

  /**
   * Updates the fish state based on the time delta.
   * @param delta Time elapsed since last tick
   */
  update(delta: number): void
}
