import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../../src/store/useGameStore'
import { FishSpecies } from '../../src/models/types'

describe('Feed and Survive Integration', () => {
  beforeEach(() => {
    useGameStore.setState({
      credits: 1000,
      tanks: [],
      tank: null,
      currentTick: 0,
    })
    useGameStore.getState().addOrSelectTank({
      id: 'survival-tank',
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

  it('should allow fish to starve if not fed', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    store.buyFish(tankId, FishSpecies.GUPPY)

    // Simulate ticks to reach starvation and death
    // Assuming hunger rate allows starvation within reasonable ticks
    let ticks = 0
    // Safety break at 2000 ticks
    while (useGameStore.getState().tank!.fish[0].isAlive && ticks < 2000) {
      useGameStore.getState().tick()
      ticks++
    }

    const fish = useGameStore.getState().tank!.fish[0]
    expect(fish.isAlive).toBe(false)
    expect(fish.health).toBe(0)
  })

  it('should prevent death if fed', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    store.buyFish(tankId, FishSpecies.GUPPY)

    // Run ticks until hungry but not dead
    // We need to know roughly when to feed.
    // If hunger rate is e.g. 1 per tick, and threshold is 80.
    // Let's feed every 50 ticks.

    for (let i = 0; i < 500; i++) {
      useGameStore.getState().tick()

      const fish = useGameStore.getState().tank!.fish[0]
      if (fish.hunger > 50) {
        useGameStore.getState().feedTank(tankId)
      }

      // Also clean tank if pollution is high to prevent death by pollution
      if (useGameStore.getState().tank!.pollution > 20) {
        useGameStore.getState().cleanTank(tankId)
      }

      if (!fish.isAlive) break
    }

    const fish = useGameStore.getState().tank!.fish[0]
    expect(fish.isAlive).toBe(true)
    expect(fish.health).toBeGreaterThan(0)
  })
})
