// Tank state validator for detecting inconsistencies (T040c)

import { type ITank } from '../../models/types'
import { TANK_CAPACITY_BOWL, TANK_CAPACITY_STANDARD, TANK_CAPACITY_BIG } from '../constants'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class TankValidator {
  /**
   * Validate a single tank for consistency and logical errors
   */
  static validateTank(tank: ITank): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate required properties
    if (!tank.id || typeof tank.id !== 'string') {
      errors.push('Tank must have a valid ID')
    }

    if (typeof tank.capacity !== 'number' || tank.capacity <= 0) {
      errors.push('Tank capacity must be a positive number')
    }

    if (typeof tank.waterQuality !== 'number' || tank.waterQuality < 0 || tank.waterQuality > 100) {
      errors.push('Water quality must be between 0 and 100')
    }

    if (typeof tank.pollution !== 'number' || tank.pollution < 0 || tank.pollution > 100) {
      errors.push('Pollution must be between 0 and 100')
    }

    // Validate tank size and capacity consistency
    if (tank.size) {
      const expectedCapacity = this.getExpectedCapacity(tank.size)
      if (tank.capacity !== expectedCapacity) {
        errors.push(`Tank size ${tank.size} should have capacity ${expectedCapacity}, but has ${tank.capacity}`)
      }
    }

    // Validate fish array
    if (!Array.isArray(tank.fish)) {
      errors.push('Tank fish must be an array')
    } else {
      // Check fish count vs capacity
      if (tank.fish.length > tank.capacity) {
        errors.push(`Tank has ${tank.fish.length} fish but capacity is ${tank.capacity}`)
      }

      // Check for dead fish
      const deadFish = tank.fish.filter((f) => !f.isAlive)
      if (deadFish.length > 0) {
        warnings.push(`Tank contains ${deadFish.length} dead fish that should be cleaned up`)
      }

      // Validate individual fish
      tank.fish.forEach((fish, index) => {
        if (!fish.id || typeof fish.id !== 'string') {
          errors.push(`Fish at index ${index} has invalid ID`)
        }

        if (typeof fish.health !== 'number' || fish.health < 0 || fish.health > 100) {
          errors.push(`Fish ${fish.id} has invalid health: ${fish.health}`)
        }

        if (typeof fish.hunger !== 'number' || fish.hunger < 0 || fish.hunger > 100) {
          errors.push(`Fish ${fish.id} has invalid hunger: ${fish.hunger}`)
        }

        if (!fish.isAlive && fish.health > 0) {
          warnings.push(`Fish ${fish.id} is marked dead but has health > 0`)
        }

        if (fish.isAlive && fish.health <= 0) {
          errors.push(`Fish ${fish.id} is marked alive but has health <= 0`)
        }
      })
    }

    // Validate water quality vs pollution consistency
    const expectedWaterQuality = Math.max(0, Math.min(100, 100 - tank.pollution))
    if (Math.abs(tank.waterQuality - expectedWaterQuality) > 1) {
      warnings.push(
        `Water quality (${tank.waterQuality}) doesn't match pollution level (${tank.pollution}). Expected: ${expectedWaterQuality}`
      )
    }

    // Validate filter constraints
    if (tank.hasFilter && tank.size === 'BOWL') {
      errors.push('BOWL tanks cannot have filters installed')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Validate an array of tanks for duplicates and consistency
   */
  static validateTankArray(tanks: ITank[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for duplicate tank IDs
    const tankIds = tanks.map((t) => t.id)
    const duplicateIds = tankIds.filter((id, index) => tankIds.indexOf(id) !== index)
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate tank IDs found: ${duplicateIds.join(', ')}`)
    }

    // Check for tank count limits
    if (tanks.length > 3) {
      warnings.push(`Player has ${tanks.length} tanks, which exceeds typical limit of 3`)
    }

    // Validate each individual tank
    tanks.forEach((tank, index) => {
      const tankResult = this.validateTank(tank)
      tankResult.errors.forEach((error) => {
        errors.push(`Tank ${index + 1} (${tank.id?.substring(0, 8) || 'no-id'}): ${error}`)
      })
      tankResult.warnings.forEach((warning) => {
        warnings.push(`Tank ${index + 1} (${tank.id?.substring(0, 8) || 'no-id'}): ${warning}`)
      })
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Get expected capacity for a tank size
   */
  private static getExpectedCapacity(size: string): number {
    switch (size) {
      case 'BOWL':
        return TANK_CAPACITY_BOWL
      case 'STANDARD':
        return TANK_CAPACITY_STANDARD
      case 'BIG':
        return TANK_CAPACITY_BIG
      default:
        return 0
    }
  }

  /**
   * Run comprehensive validation and return a summary
   */
  static validateGame(tanks: ITank[]): {
    isValid: boolean
    summary: string
    totalErrors: number
    totalWarnings: number
    details: ValidationResult
  } {
    const result = this.validateTankArray(tanks)

    return {
      isValid: result.isValid,
      summary: result.isValid
        ? `✅ All ${tanks.length} tanks are valid`
        : `❌ Found ${result.errors.length} errors and ${result.warnings.length} warnings`,
      totalErrors: result.errors.length,
      totalWarnings: result.warnings.length,
      details: result,
    }
  }
}
