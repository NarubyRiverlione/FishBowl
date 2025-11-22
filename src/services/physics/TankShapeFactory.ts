import { ITankShape } from '../../models/types/tankShape'
import { TankSize } from '../../models/types/index'
import { RectangularTankShape } from './shapes/RectangularTankShape'
import { CircularTankShape } from './shapes/CircularTankShape'
import { TANK_BOWL_SIZE, TANK_STANDARD_SIZE, TANK_BIG_WIDTH, TANK_BIG_HEIGHT } from '../../lib/constants'

/**
 * Factory function to create appropriate tank shape based on tank size.
 * Centers shapes at (250, 250) for consistency with existing rendering.
 * @param size Tank size (BOWL, STANDARD, BIG)
 * @returns ITankShape instance (circular for BOWL, rectangular for others)
 */
export function createTankShape(size: TankSize): ITankShape {
  const centerX = 250
  const centerY = 250

  switch (size) {
    case 'BOWL':
      // BOWL is circular with radius = TANK_BOWL_SIZE / 2
      return new CircularTankShape(centerX, centerY, TANK_BOWL_SIZE / 2)

    case 'STANDARD': {
      // STANDARD is square (rectangular with equal dimensions)
      return new RectangularTankShape(centerX, centerY, TANK_STANDARD_SIZE, TANK_STANDARD_SIZE)
    }

    case 'BIG': {
      // BIG is rectangular with distinct width/height
      return new RectangularTankShape(centerX, centerY, TANK_BIG_WIDTH, TANK_BIG_HEIGHT)
    }

    default: {
      const _exhaustive: never = size
      throw new Error(`Unknown tank size: ${_exhaustive}`)
    }
  }
}
