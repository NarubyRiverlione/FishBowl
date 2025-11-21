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
export const TANK_CAPACITY_STANDARD = 15
export const MAX_TANKS_DEFAULT = 3

// Hunger/health thresholds
export const HUNGER_STARVATION_THRESHOLD = 90
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
export const FISH_BASE_SIZE = 150 // Base width/height in pixels
export const FISH_BASE_RADIUS = 25 // Base collision radius in pixels
export const FISH_BASE_MASS = 1 // Base mass for physics calculations
export const FISH_FRICTION = 0.002 // Water resistance coefficient

// Fish Behavior Constants
export const SWIM_DIRECTION_CHANGE_PROBABILITY = 0.005 // 0.5% chance per frame to change direction
export const SWIM_DIRECTION_CHANGE_FORCE = 0.4 // Force multiplier for direction changes
export const SWIM_MIN_SPEED = 1 // Minimum speed threshold before boost
export const SWIM_BOOST_FORCE = 1.0 // Force multiplier for speed boost

// Tank Constants
export const WATER_LEVEL = 0.95 // Water fills 85% of tank height (from bottom)

// Life Stage Constants
export const FISH_AGE_YOUNG_MAX = 120 // Ticks when fish becomes mature
export const FISH_AGE_MATURE_MAX = 300 // Ticks when fish becomes old
export const FISH_LIFE_STAGE_YOUNG_SCALE = 1.0 // Size multiplier for young fish
export const FISH_LIFE_STAGE_MATURE_SCALE = 1.3 // Size multiplier for mature fish
export const FISH_LIFE_STAGE_OLD_SCALE = 1.3 // Size multiplier for old fish
export const FISH_LIFE_STAGE_OLD_SATURATION = 0.6 // Color saturation multiplier for old fish

// Tank Dimensions
export const TANK_DEFAULT_WIDTH = 400
export const TANK_DEFAULT_HEIGHT = 300
export const TANK_UPGRADED_WIDTH = 800
export const TANK_UPGRADED_HEIGHT = 600

// Game Values
export const GAME_INITIAL_CREDITS = 50
export const GAME_DEV_MODE_CREDITS = 1000
export const GAME_INITIAL_TICK = 0
export const GAME_INITIAL_TIME = 0

// Water Quality
export const WATER_QUALITY_MAX = 100
export const WATER_QUALITY_INITIAL = 100
export const POLLUTION_INITIAL = 0
export const TEMPERATURE_DEFAULT = 24

// Physics Constants
export const COLLISION_RESTITUTION = 0.8 // Bounciness factor for collisions
export const SPAWN_MARGIN_BUFFER = 50 // Safe margin for fish spawning
export const FISH_SPAWN_POSITION_BUFFER = 5 // Extra buffer for safe fish positioning
export const SPAWN_BUFFER = 50 // Buffer for fish spawning
export const DEFAULT_MAX_VELOCITY = 2 // Default maximum velocity for fish

// UI Constants
export const TANK_BORDER_WIDTH = 6
export const TANK_BORDER_COLOR = 0x888888
export const WATER_SURFACE_WIDTH = 2
export const WATER_SURFACE_COLOR = 0x66aaff
export const WATER_SURFACE_ALPHA = 0.6

// Fish Health Constants
export const WATER_QUALITY_POOR_THRESHOLD = 70 // Below this, fish health decreases
export const FISH_AGE_MAX_MULTIPLIER_DIVISOR = 300 // Used for age-based calculations
export const FISH_VALUE_MAX_MULTIPLIER = 2.0 // Maximum age multiplier for fish value

/**
 * Base colors for fish species.
 * Each species gets a fixed base color with individual variations.
 * - GUPPY: Coral (Orange/Red family)
 * - GOLDFISH: Gold (Yellow family)
 * - TETRA: Deep Sky Blue (Blue family)
 * - BETTA: Medium Purple (Purple family)
 */
export const FISH_SPECIES_BASE_COLORS = {
  GUPPY: '#FF7F50', // Coral - Orange/Red family
  GOLDFISH: '#FFD700', // Gold - Yellow family
  TETRA: '#00BFFF', // Deep Sky Blue - Blue family
  BETTA: '#9370DB', // Medium Purple - Purple family
}

// Fish spawn size range
export const FISH_SPAWN_SIZE_MIN = 0.5
export const FISH_SPAWN_SIZE_MAX = 1.5

// Dev mode age constants for testing
export const DEV_MODE_YOUNG_AGE = 50
export const DEV_MODE_MATURE_AGE = 200
export const DEV_MODE_OLD_AGE = 400

// Percentage and calculation constants
export const PERCENTAGE_MAX = 100 // Maximum value for percentages (health, hunger, water quality)
export const PERFORMANCE_LOG_INTERVAL_MS = 1000 // Interval for performance logging
export const MILLISECONDS_PER_SECOND = 1000 // Conversion factor
export const DEFAULT_FPS_FALLBACK = 60 // Fallback FPS value for calculations
