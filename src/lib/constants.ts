// Game constants centralized for Core Game Mechanics (MVP)
export const TICK_RATE_SECONDS = 1

// Feeding costs
export const FEED_BASE_COST = 2
export const FEED_PER_FISH_COST = 1
export const HUNGER_REDUCTION_ON_FEED = 30

// Pollution & water quality
export const POLLUTION_PER_FISH_PER_TICK = 0.1
export const POLLUTION_PER_FEEDING = 2
export const FILTER_POLLUTION_REDUCTION_PER_TICK = 0.5

// Clean action
export const CLEAN_COST = 10
export const CLEAN_POLLUTION_REDUCTION = 30

// Filter and tank upgrade costs
export const FILTER_COST = 50
export const TANK_UPGRADE_COST = 75

// Tank capacities and multi-tank support
export const TANK_CAPACITY_BOWL = 1
export const TANK_CAPACITY_STANDARD = 20
export const MAX_TANKS_DEFAULT = 3

// Hunger/health thresholds
export const HUNGER_STARVATION_THRESHOLD = 80
export const HEALTH_DECREMENT_ON_STARVATION = 1
export const HEALTH_DECREMENT_ON_POLLUTION = 0.5

// Maturity
export const MATURE_AGE_SECONDS = 120
export const MATURITY_BONUS = 50

export default {
  TICK_RATE_SECONDS,
  FEED_BASE_COST,
  FEED_PER_FISH_COST,
  HUNGER_REDUCTION_ON_FEED,
  POLLUTION_PER_FISH_PER_TICK,
  POLLUTION_PER_FEEDING,
  FILTER_POLLUTION_REDUCTION_PER_TICK,
  CLEAN_COST,
  CLEAN_POLLUTION_REDUCTION,
  FILTER_COST,
  TANK_UPGRADE_COST,
  HUNGER_STARVATION_THRESHOLD,
  HEALTH_DECREMENT_ON_STARVATION,
  HEALTH_DECREMENT_ON_POLLUTION,
  MATURE_AGE_SECONDS,
  MATURITY_BONUS,
}
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
