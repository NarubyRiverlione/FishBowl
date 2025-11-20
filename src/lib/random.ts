import { FISH_PALETTE } from './constants'

/**
 * Generates a random hex color string from a predefined palette.
 * @returns Hex color string
 */
export const randomColor = (): string => {
  const index = Math.floor(Math.random() * FISH_PALETTE.length)
  return FISH_PALETTE[index] ?? '#FF7F50' // Fallback to coral if undefined
}

/**
 * Generates a random scale factor between min and max.
 * @param min Minimum scale
 * @param max Maximum scale
 * @returns Random scale factor
 */
export const randomSize = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

/**
 * Generates a random velocity component between -max and max.
 * @param maxSpeed Maximum speed
 * @returns Random velocity
 */
export const randomVelocity = (maxSpeed: number): number => {
  return (Math.random() * 2 - 1) * maxSpeed
}

/**
 * Generates a random position within bounds.
 * @param min Minimum position
 * @param max Maximum position
 * @returns Random position
 */
export const randomPosition = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}
