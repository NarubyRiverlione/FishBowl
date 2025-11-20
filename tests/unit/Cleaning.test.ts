import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../../src/store/useGameStore'
import { CLEAN_COST, CLEAN_POLLUTION_REDUCTION } from '../../src/lib/constants'

describe('Cleaning Mechanics', () => {
  beforeEach(() => {
    useGameStore.setState({
      credits: 100,
      tanks: [],
      tank: null,
    })
    // Initialize a tank with pollution
    useGameStore.getState().addOrSelectTank({
      id: 'test-tank',
      size: 'BOWL',
      capacity: 5,
      waterQuality: 50,
      pollution: 50,
      hasFilter: false,
      temperature: 24,
      fish: [],
      createdAt: Date.now(),
      width: 100,
      height: 100,
      backgroundColor: 0x000000,
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

    expect(newState.tank!.waterQuality).toBe(Math.min(100, initialWaterQuality + CLEAN_POLLUTION_REDUCTION))
  })

  it('should not clean if insufficient credits', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    useGameStore.setState({ credits: 0 })

    useGameStore.getState().cleanTank(tankId)

    const newState = useGameStore.getState()
    expect(newState.credits).toBe(0)
    expect(newState.tank!.pollution).toBe(50)
  })
})
