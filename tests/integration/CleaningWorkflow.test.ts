import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../../src/store/useGameStore'
import { CLEAN_COST, CLEAN_POLLUTION_REDUCTION } from '../../src/lib/constants'
import { TEST_VALUES, BUSINESS_LOGIC } from '../config/testConstants'

describe('Cleaning Workflow Integration', () => {
  beforeEach(() => {
    useGameStore.setState({
      credits: TEST_VALUES.CREDITS.MODERATE,
      tanks: [],
      tank: null,
    })
    // Initialize a tank with pollution
    useGameStore.getState().addOrSelectTank({
      id: 'test-tank',
      size: 'BOWL',
      capacity: 5,
      waterQuality: TEST_VALUES.WATER.MODERATE_POLLUTION.waterQuality,
      pollution: TEST_VALUES.WATER.MODERATE_POLLUTION.pollution,
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

  it('should deduct credits and reduce pollution when cleaning', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    const initialCredits = useGameStore.getState().credits
    const initialPollution = useGameStore.getState().tank!.pollution

    // Clean
    useGameStore.getState().cleanTank(tankId)

    const newState = useGameStore.getState()

    expect(newState.credits).toBe(initialCredits - CLEAN_COST)
    expect(newState.tank!.pollution).toBe(Math.max(0, initialPollution - CLEAN_POLLUTION_REDUCTION))
  })

  it('should improve water quality when cleaning', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    const initialWaterQuality = useGameStore.getState().tank!.waterQuality

    // Clean
    useGameStore.getState().cleanTank(tankId)

    const newState = useGameStore.getState()

    expect(newState.tank!.waterQuality).toBe(
      Math.min(BUSINESS_LOGIC.TANK_VALUES.PERCENTAGE_MAX, initialWaterQuality + CLEAN_POLLUTION_REDUCTION)
    )
  })

  it('should not clean if insufficient credits', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    useGameStore.setState({ credits: TEST_VALUES.CREDITS.INSUFFICIENT })

    useGameStore.getState().cleanTank(tankId)

    const newState = useGameStore.getState()
    expect(newState.credits).toBe(TEST_VALUES.CREDITS.INSUFFICIENT)
    expect(newState.tank!.pollution).toBe(TEST_VALUES.WATER.MODERATE_POLLUTION.pollution)
  })
})
