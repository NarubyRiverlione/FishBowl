import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../../src/store/useGameStore'
import { FishSpecies } from '../../src/models/types'
import { FishService } from '../../src/services/FishService'
import { TEST_VALUES, BUSINESS_LOGIC } from '../config/testConstants'

describe('Sell Fish Workflow Integration', () => {
  beforeEach(() => {
    useGameStore.setState({
      credits: TEST_VALUES.CREDITS.INSUFFICIENT,
      tanks: [],
      tank: null,
      currentTick: 0,
    })
    // Initialize a tank
    useGameStore.getState().addOrSelectTank({
      id: 'sell-tank',
      size: 'BOWL',
      capacity: 5,
      waterQuality: BUSINESS_LOGIC.TANK_VALUES.WATER_QUALITY_MAX,
      pollution: BUSINESS_LOGIC.TANK_VALUES.POLLUTION_MIN,
      hasFilter: false,
      temperature: 24,
      fish: [],
      createdAt: Date.now(),
      geometry: {
        width: TEST_VALUES.DIMENSIONS.TANK_WIDTH,
        height: TEST_VALUES.DIMENSIONS.TANK_HEIGHT,
        centerX: TEST_VALUES.DIMENSIONS.TANK_WIDTH / 2,
        centerY: TEST_VALUES.DIMENSIONS.TANK_HEIGHT / 2,
      },
      floor: {
        visible: false,
        type: 'invisible',
        geometry: {
          x: 0,
          y: TEST_VALUES.DIMENSIONS.TANK_HEIGHT - 1,
          width: TEST_VALUES.DIMENSIONS.TANK_WIDTH,
          height: 1,
        },
        restitution: 0.2,
        friction: 0.002,
      },
      backgroundColor: 0x87ceeb,
    })
  })

  it('should sell fish and increase credits', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    // Add a fish manually to ensure we know its properties
    const fish = FishService.createFish(FishSpecies.GUPPY)
    const tank = store.tank!
    const updatedTank = { ...tank, fish: [fish] }
    useGameStore.setState({
      tanks: [updatedTank],
      tank: updatedTank,
    })

    const expectedValue = FishService.calculateFishValue(fish)

    // Sell
    useGameStore.getState().sellFish(tankId, fish.id)

    const newState = useGameStore.getState()
    expect(newState.credits).toBe(expectedValue)
    expect(newState.tank!.fish.length).toBe(0)
  })

  it('should not do anything if fish not found', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    // Sell non-existent fish
    useGameStore.getState().sellFish(tankId, 'non-existent-id')

    const newState = useGameStore.getState()
    expect(newState.credits).toBe(0)
  })
})
