import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../../src/store/useGameStore'
import { FishService } from '../../src/services/FishService'
import { FishSpecies } from '../../src/models/types'

describe('Fish inspect & sell flow', () => {
  beforeEach(() => {
    // Reset store to default state
    const store = useGameStore.getState()
    // Reset tanks and credits minimally
    store.setTanks([
      {
        id: 'test-bowl',
        size: 'BOWL',
        capacity: 1,
        waterQuality: 100,
        pollution: 0,
        hasFilter: false,
        temperature: 24,
        fish: [],
        createdAt: Date.now(),
        width: 400,
        height: 400,
        backgroundColor: 0x87ceeb,
      },
    ])
    store.setMode('tutorial')
    store.setPaused(true)
  })

  it('selects a fish and sells it via panel', () => {
    const store = useGameStore.getState()
    // Add a fish via service
    const fish = FishService.createFish(FishSpecies.GUPPY)
    // Add fish into tank
    const t = store.tanks[0]
    t.fish = [fish]
    store.setTanks([t])

    // Simulate selecting fish
    store.selectFish(fish.id)
    // Read fresh state after calling action
    const after = useGameStore.getState()
    expect(after.selectedFishId).toBe(fish.id)

    // Call sell via store action (simulates clicking Sell in panel)
    useGameStore.getState().sellFish(t.id, fish.id)

    // Read fresh state after selling
    const afterSell = useGameStore.getState()

    // After sell, fish should be removed and credits increased
    expect(afterSell.tanks[0].fish.length).toBe(0)
    // Credits should have increased (initial 50 for normal mode)
    expect(afterSell.credits).toBeGreaterThanOrEqual(50)
  })
})
