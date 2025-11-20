import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../../src/store/useGameStore'
import { FishSpecies } from '../../src/models/types'
import { FEED_BASE_COST, FEED_PER_FISH_COST, POLLUTION_PER_FEEDING } from '../../src/lib/constants'

describe('Feeding Mechanics', () => {
  beforeEach(() => {
    useGameStore.setState({
      credits: 100,
      tanks: [],
      tank: null,
    })
    // Initialize a tank
    useGameStore.getState().addOrSelectTank({
      id: 'test-tank',
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

  it('should deduct credits and increase pollution when feeding', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    // Add a fish
    store.buyFish(tankId, FishSpecies.GUPPY)

    const initialCredits = useGameStore.getState().credits
    const initialPollution = useGameStore.getState().tank!.pollution

    // Feed
    useGameStore.getState().feedTank(tankId)

    const newState = useGameStore.getState()
    const expectedCost = FEED_BASE_COST + 1 * FEED_PER_FISH_COST

    expect(newState.credits).toBe(initialCredits - expectedCost)
    expect(newState.tank!.pollution).toBe(initialPollution + POLLUTION_PER_FEEDING)
  })

  it('should reduce hunger of living fish', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    // Add a fish
    store.buyFish(tankId, FishSpecies.GUPPY)

    // Manually set hunger
    const tank = useGameStore.getState().tank!
    const fish = tank.fish[0]

    // Update fish hunger in state directly for setup
    const hungryFish = { ...fish, hunger: 50 }
    const updatedTank = { ...tank, fish: [hungryFish] }
    useGameStore.setState({
      tanks: [updatedTank],
      tank: updatedTank,
    })

    // Feed
    useGameStore.getState().feedTank(tankId)

    const newState = useGameStore.getState()
    const fedFish = newState.tank!.fish[0]

    expect(fedFish.hunger).toBeLessThan(50)
    expect(fedFish.lastFedAt).toBeDefined()
  })

  it('should not feed if insufficient credits', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    useGameStore.setState({ credits: 0 })

    useGameStore.getState().feedTank(tankId)

    const newState = useGameStore.getState()
    expect(newState.credits).toBe(0)
    expect(newState.tank!.pollution).toBe(0)
  })
})
