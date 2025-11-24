// Floor entity types for the FishBowl game
import { TankSize } from './tank'
import { FLOOR_RESTITUTION } from '../../lib/constants'

/**
 * Floor geometry - defines position and dimensions
 */
export interface IFloorGeometry {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Floor data interface for tanks
 * Defines the floor characteristics for different tank types
 */
export interface IFloor {
  // Floor visibility and type
  visible: boolean
  type: 'invisible' | 'pebble' | 'sand'

  // Dimensions and positioning
  geometry: IFloorGeometry

  // Physics properties
  restitution: number // 0.2 for gentle bouncing
  friction: number // Water resistance on floor

  // Visual properties (for rendered floors)
  color?: number // Hex color for visible floors
  opacity?: number // Alpha transparency
}

/**
 * Get floor configuration based on tank size
 * Different tank types have different floor characteristics
 */
export const getFloorConfig = (
  tankSize: TankSize,
  tankWidth: number,
  tankHeight: number
): IFloor => {
  const baseY = tankHeight - 1 // 1px height for floor

  switch (tankSize) {
    case 'BOWL': {
      // Invisible floor for bowl tanks
      return {
        visible: false,
        type: 'invisible',
        geometry: {
          x: 0,
          y: baseY,
          width: tankWidth,
          height: 1,
        },
        restitution: FLOOR_RESTITUTION,
        friction: 0.002,
      }
    }

    case 'STANDARD': {
      // Visible pebble floor for standard tanks
      return {
        visible: true,
        type: 'pebble',
        geometry: {
          x: 0,
          y: baseY,
          width: tankWidth,
          height: 40,
        },
        restitution: FLOOR_RESTITUTION,
        friction: 0.002,
        color: 0xc9a961, // Sandy/pebble color
        opacity: 0.8,
      }
    }

    case 'BIG': {
      // Visible sand floor for big tanks
      return {
        visible: true,
        type: 'sand',
        geometry: {
          x: 0,
          y: baseY,
          width: tankWidth,
          height: 40,
        },
        restitution: FLOOR_RESTITUTION,
        friction: 0.002,
        color: 0xd4b896, // Light sand color
        opacity: 0.75,
      }
    }

    default: {
      return {
        visible: false,
        type: 'invisible',
        geometry: {
          x: 0,
          y: baseY,
          width: tankWidth,
          height: 1,
        },
        restitution: FLOOR_RESTITUTION,
        friction: 0.002,
      }
    }
  }
}
