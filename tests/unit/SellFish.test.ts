import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../../src/store/useGameStore'
import { FishSpecies } from '../../src/models/types'
import { FishService } from '../../src/services/FishService'

describe('Sell Fish Mechanics', () => {
  beforeEach(() => {
    useGameStore.setState({
      credits: 0,
      tanks: [],
      tank: null,
      currentTick: 0,
    })
    // Initialize a tank
    useGameStore.getState().addOrSelectTank({
      id: 'sell-tank',
      size: 'BOWL',
      capacity: 5,
      waterQuality: 100,
      pollution: 0,
      hasFilter: false,
      temperature: 24,
      fish: [],
      createdAt: Date.now(),
      width: 100,
      height: 100,
      backgroundColor: 0x000000,
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
