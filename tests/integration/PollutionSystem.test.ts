import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../../src/store/useGameStore'
import { FishSpecies } from '../../src/models/types'
import {
  POLLUTION_PER_FISH_PER_TICK,
  FILTER_POLLUTION_REDUCTION_PER_TICK,
  FILTER_COST,
  HEALTH_DECREMENT_ON_POLLUTION,
} from '../../src/lib/constants'

describe('Pollution System Integration', () => {
  beforeEach(() => {
    useGameStore.setState({
      credits: 1000,
      tanks: [],
      tank: null,
      currentTick: 0,
    })
    // Initialize a STANDARD tank (needed for filter)
    useGameStore.getState().addOrSelectTank({
      id: 'pollution-tank',
      size: 'STANDARD',
      capacity: 15,
      waterQuality: 100,
      pollution: 0,
      hasFilter: false,
      temperature: 24,
      fish: [],
      createdAt: Date.now(),
      geometry: {
        width: 100,
        height: 100,
        centerX: 50,
        centerY: 50,
      },
      backgroundColor: 0x000000,
      floor: {
        visible: true,
        type: 'pebble',
        geometry: {
          x: 0,
          y: 90,
          width: 100,
          height: 10,
        },
        restitution: 0.3,
        friction: 0.5,
      },
    })
  })

  it('should accumulate pollution from fish over time', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    // Add 10 fish
    for (let i = 0; i < 10; i++) {
      store.buyFish(tankId, FishSpecies.GUPPY)
    }

    const initialPollution = useGameStore.getState().tank!.pollution

    // Tick
    useGameStore.getState().tick()

    const newState = useGameStore.getState()
    const expectedIncrease = 10 * POLLUTION_PER_FISH_PER_TICK

    expect(newState.tank!.pollution).toBeCloseTo(initialPollution + expectedIncrease)
    expect(newState.tank!.waterQuality).toBeCloseTo(100 - (initialPollution + expectedIncrease))
  })

  it('should reduce pollution accumulation when filter is installed', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    // Add 10 fish
    for (let i = 0; i < 10; i++) {
      store.buyFish(tankId, FishSpecies.GUPPY)
    }

    // Install filter
    useGameStore.getState().buyFilter(tankId)
    expect(useGameStore.getState().tank!.hasFilter).toBe(true)

    const initialPollution = useGameStore.getState().tank!.pollution

    // Tick
    useGameStore.getState().tick()

    const newState = useGameStore.getState()
    const expectedIncrease = 10 * POLLUTION_PER_FISH_PER_TICK - FILTER_POLLUTION_REDUCTION_PER_TICK

    expect(newState.tank!.pollution).toBeCloseTo(initialPollution + expectedIncrease)
  })

  it('should apply health penalty when water quality is low', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    // Add a fish
    store.buyFish(tankId, FishSpecies.GUPPY)

    // Manually set high pollution/low water quality
    const tank = useGameStore.getState().tank!
    const pollutedTank = {
      ...tank,
      pollution: 60,
      waterQuality: 40,
    }
    useGameStore.setState({
      tanks: [pollutedTank],
      tank: pollutedTank,
    })

    const initialHealth = useGameStore.getState().tank!.fish[0]!.health

    // Tick
    useGameStore.getState().tick()

    const newState = useGameStore.getState()
    const fish = newState.tank!.fish[0]!

    // Should have lost health due to pollution
    // Note: Hunger also increases, but starvation threshold is 80, so hunger shouldn't affect health yet (starts at 0)
    expect(fish.health).toBe(initialHealth - HEALTH_DECREMENT_ON_POLLUTION)
  })

  it('should allow buying filter for STANDARD tank', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id
    const initialCredits = store.credits

    useGameStore.getState().buyFilter(tankId)

    const newState = useGameStore.getState()
    expect(newState.tank!.hasFilter).toBe(true)
    expect(newState.credits).toBe(initialCredits - FILTER_COST)
  })

  it('should NOT allow buying filter for BOWL tank', () => {
    // Create a BOWL tank
    useGameStore.getState().addOrSelectTank({
      id: 'bowl-tank',
      size: 'BOWL',
      capacity: 1,
      waterQuality: 100,
      pollution: 0,
      hasFilter: false,
      temperature: 24,
      fish: [],
      createdAt: Date.now(),
      geometry: {
        width: 100,
        height: 100,
        centerX: 50,
        centerY: 50,
      },
      backgroundColor: 0x000000,
      floor: {
        visible: true,
        type: 'pebble',
        geometry: {
          x: 0,
          y: 90,
          width: 100,
          height: 10,
        },
        restitution: 0.3,
        friction: 0.5,
      },
    })

    const tankId = 'bowl-tank'
    const initialCredits = useGameStore.getState().credits

    useGameStore.getState().buyFilter(tankId)

    const newState = useGameStore.getState()
    expect(newState.tank!.hasFilter).toBe(false)
    expect(newState.credits).toBe(initialCredits)
  })
})
