/**
 * Test configuration constants for FishBowl game tests.
 *
 * This file centralizes test scenarios and prevents magic numbers in tests
 * while maintaining explicit user-facing values for E2E testing.
 */

import {
  GAME_DEV_MODE_CREDITS,
  GAME_INITIAL_CREDITS,
  TANK_CAPACITY_STANDARD,
  TANK_CAPACITY_BOWL,
  FEED_BASE_COST,
  FEED_PER_FISH_COST,
  CLEAN_COST,
  FILTER_COST,
  CLEAN_POLLUTION_REDUCTION,
  WATER_QUALITY_INITIAL,
  POLLUTION_INITIAL,
  PERCENTAGE_MAX,
  HUNGER_REDUCTION_ON_FEED,
  POLLUTION_PER_FEEDING,
  TANK_UPGRADE_COST,
  FISH_SPECIES_CONFIG,
} from '../../src/lib/constants'

/**
 * Test scenarios for different game modes
 */
export const TEST_SCENARIOS = {
  /**
   * Developer mode test scenario - used in E2E tests
   */
  DEV_MODE: {
    INITIAL_CREDITS: GAME_DEV_MODE_CREDITS, // 1000
    TANK_CAPACITY: TANK_CAPACITY_STANDARD, // 15
    INITIAL_FISH_COUNT: 12, // Created by dev mode
    URL_PARAMS: '?dev=true&testHelpers=true',
  },

  /**
   * Normal game mode test scenario
   */
  NORMAL_MODE: {
    INITIAL_CREDITS: GAME_INITIAL_CREDITS, // 50
    TANK_CAPACITY: TANK_CAPACITY_BOWL, // 1
    INITIAL_FISH_COUNT: 0,
    URL_PARAMS: '',
  },
} as const

/**
 * Business logic test constants - import these for calculation tests
 */
export const BUSINESS_LOGIC = {
  COSTS: {
    GUPPY: FISH_SPECIES_CONFIG.GUPPY.baseValue,
    GOLDFISH: FISH_SPECIES_CONFIG.GOLDFISH.baseValue,
    TETRA: FISH_SPECIES_CONFIG.TETRA.baseValue,
    BETTA: FISH_SPECIES_CONFIG.BETTA.baseValue,
    FEED_BASE: FEED_BASE_COST,
    FEED_PER_FISH: FEED_PER_FISH_COST,
    CLEAN: CLEAN_COST,
    FILTER: FILTER_COST,
    TANK_UPGRADE: TANK_UPGRADE_COST,
  },

  TANK_VALUES: {
    WATER_QUALITY_MAX: WATER_QUALITY_INITIAL,
    POLLUTION_MIN: POLLUTION_INITIAL,
    PERCENTAGE_MAX: PERCENTAGE_MAX,
    CLEAN_REDUCTION: CLEAN_POLLUTION_REDUCTION,
  },

  FEEDING: {
    HUNGER_REDUCTION: HUNGER_REDUCTION_ON_FEED,
    POLLUTION_INCREASE: POLLUTION_PER_FEEDING,
  },

  CALCULATIONS: {
    /**
     * Calculate feeding cost for a given number of fish
     */
    feedingCost: (fishCount: number) => FEED_BASE_COST + FEED_PER_FISH_COST * fishCount,

    /**
     * Calculate credits after buying a fish
     */
    creditsAfterPurchase: (initialCredits: number, fishCost: number) => initialCredits - fishCost,

    /**
     * Calculate expected fish count after dev mode + purchases
     */
    fishCountAfterPurchase: (initialDevFish: number, purchased: number) => initialDevFish + purchased,

    /**
     * Calculate water quality from pollution
     */
    waterQualityFromPollution: (pollution: number) => Math.max(0, PERCENTAGE_MAX - pollution),

    /**
     * Calculate pollution after cleaning
     */
    pollutionAfterCleaning: (currentPollution: number) => Math.max(0, currentPollution - CLEAN_POLLUTION_REDUCTION),
  },
} as const

/**
 * Common test values for mock objects and scenarios
 */
export const TEST_VALUES = {
  /**
   * Standard dimensions used in tests
   */
  DIMENSIONS: {
    TANK_WIDTH: 100,
    TANK_HEIGHT: 100,
  },

  /**
   * Common credit amounts used in tests
   */
  CREDITS: {
    SUFFICIENT: 1000, // More than enough for any purchase
    MODERATE: 100, // Enough for most basic operations
    INSUFFICIENT: 0, // Not enough for any purchase
  },

  /**
   * Water quality and pollution test values
   */
  WATER: {
    CLEAN: {
      pollution: POLLUTION_INITIAL,
      waterQuality: WATER_QUALITY_INITIAL,
    },
    MODERATE_POLLUTION: {
      pollution: 50,
      waterQuality: 50,
    },
    DIRTY: {
      pollution: 80,
      waterQuality: 20,
    },
  },

  /**
   * Feeding test values
   */
  FEEDING: {
    INITIAL_HUNGER: 50,
  },

  /**
   * Performance and stress test values
   */
  STRESS_TEST: {
    BASIC_FISH_COUNT: 20,
    FISH_COUNT: 50,
    FRAME_COUNT: 60,
    MAX_FRAME_TIME: 1000,
    MANY_FISH: 50,
    MAX_PERFORMANCE_MS: 1000,
    E2E_TIMEOUT_MS: 3000,
  },
} as const

/**
 * User-facing values that should remain stable (contracts)
 * These are used in E2E tests and should not change without migration
 */
export const USER_CONTRACTS = {
  /**
   * Values that appear in the UI and should be stable
   */
  UI_VALUES: {
    DEV_MODE_CREDITS: 1000,
    GUPPY_COST: 50,
    FEED_COST_BASE: 2,
    CLEAN_COST: 10,
  },

  /**
   * Expected UI text patterns for E2E tests
   */
  UI_PATTERNS: {
    CREDITS: (amount: number) => new RegExp(`^${amount}$`),
    TANK_STATUS: (current: number, capacity: number) => new RegExp(`STANDARD ${current}\\/${capacity}`),
  },
} as const

/**
 * Test helper functions
 */
export const TEST_HELPERS = {
  /**
   * Create expected credit values for common scenarios
   */
  expectCreditsAfterDevModeActions: {
    afterBuyingGuppy: () => TEST_SCENARIOS.DEV_MODE.INITIAL_CREDITS - USER_CONTRACTS.UI_VALUES.GUPPY_COST,
    afterBuyingAndFeeding: () => {
      const afterPurchase = TEST_SCENARIOS.DEV_MODE.INITIAL_CREDITS - USER_CONTRACTS.UI_VALUES.GUPPY_COST
      const feedCost = BUSINESS_LOGIC.CALCULATIONS.feedingCost(TEST_SCENARIOS.DEV_MODE.INITIAL_FISH_COUNT + 1)
      return afterPurchase - feedCost
    },
    afterCleaning: () => TEST_SCENARIOS.DEV_MODE.INITIAL_CREDITS - USER_CONTRACTS.UI_VALUES.CLEAN_COST,
  },
} as const
