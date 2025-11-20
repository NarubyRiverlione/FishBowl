// Fish Physics Constants
export const FISH_BASE_SIZE = 48 // Base width/height in pixels
export const FISH_BASE_RADIUS = 24 // Base collision radius in pixels
export const FISH_BASE_MASS = 1 // Base mass for physics calculations
export const FISH_FRICTION = 0.002 // Water resistance coefficient

// Fish Behavior Constants
export const SWIM_DIRECTION_CHANGE_PROBABILITY = 0.005 // 0.5% chance per frame to change direction
export const SWIM_DIRECTION_CHANGE_FORCE = 0.4 // Force multiplier for direction changes
export const SWIM_MIN_SPEED = 1 // Minimum speed threshold before boost
export const SWIM_BOOST_FORCE = 1.0 // Force multiplier for speed boost

// Tank Constants
export const WATER_LEVEL = 0.85 // Water fills 85% of tank height (from bottom)

/**
 * Palette of fish colors.
 * - Orange (Clownfish)
 * - Blue (Tang)
 * - Yellow (Tang)
 * - Purple (Basslet)
 * - Red (Snapper)
 */
export const FISH_PALETTE = [
  '#FF7F50', // Coral
  '#00BFFF', // Deep Sky Blue
  '#FFD700', // Gold
  '#9370DB', // Medium Purple
  '#FF6347', // Tomato
]
