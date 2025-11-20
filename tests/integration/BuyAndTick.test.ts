import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../../src/store/useGameStore'
import { FishSpecies, FISH_SPECIES_CONFIG } from '../../src/models/types'

describe('Buy and Tick Integration', () => {
  beforeEach(() => {
    useGameStore.setState({
      credits: 50,
      tanks: [],
      currentTick: 0,
      totalTime: 0,
      isPaused: false,
    })
    // Initialize with default tank via setMode
    useGameStore.getState().setMode('tutorial')
  })

  it('should buy fish and update credits', () => {
    const store = useGameStore.getState()
    const tankId = store.tanks[0].id
    const initialCredits = store.credits
    const fishCost = FISH_SPECIES_CONFIG[FishSpecies.GUPPY].baseValue

    store.buyFish(tankId, FishSpecies.GUPPY)

    const updatedStore = useGameStore.getState()
    expect(updatedStore.credits).toBe(initialCredits - fishCost)
    expect(updatedStore.tanks[0].fish.length).toBe(1)
    expect(updatedStore.tanks[0].fish[0].species).toBe(FishSpecies.GUPPY)
  })

  it('should increment fish age on tick', () => {
    const store = useGameStore.getState()
    const tankId = store.tanks[0].id
    store.buyFish(tankId, FishSpecies.GUPPY)

    const fish = useGameStore.getState().tanks[0].fish[0]
    expect(fish.age).toBe(0)

    store.tick()

    const updatedFish = useGameStore.getState().tanks[0].fish[0]
    expect(updatedFish.age).toBe(1)
  })
})
