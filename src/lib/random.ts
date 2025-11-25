import { FISH_SPECIES_BASE_COLORS, DEFAULT_FALLBACK_COLOR } from './constants'
import { FishSpecies } from '../models/types'

/**
 * Generates a species-specific color with individual variation.
 * Each fish gets the base color for their species with slight random variations.
 * @param species The fish species
 * @returns Hex color string with species-appropriate variation
 */
export const getSpeciesColor = (species: FishSpecies): string => {
  const baseColor = FISH_SPECIES_BASE_COLORS[species]
  if (!baseColor) return DEFAULT_FALLBACK_COLOR

  // Parse the hex color
  const hex = baseColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Add small random variations (-20 to +20 for each channel)
  const variation = 20
  const newR = Math.max(0, Math.min(255, r + Math.floor(Math.random() * (variation * 2 + 1)) - variation))
  const newG = Math.max(0, Math.min(255, g + Math.floor(Math.random() * (variation * 2 + 1)) - variation))
  const newB = Math.max(0, Math.min(255, b + Math.floor(Math.random() * (variation * 2 + 1)) - variation))

  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`
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
