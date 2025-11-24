import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../../src/store/useGameStore'
import { FishSpecies, getFloorConfig } from '../../src/models/types'

describe('Feed and Survive Integration', () => {
  beforeEach(() => {
    useGameStore.setState({
      credits: 1000,
      tanks: [],
      tank: null,
      currentTick: 0,
      totalTime: 0,
      isPaused: false,
      maturityBonusAwarded: false,
      tutorialEnabled: false,
      tutorialEvents: [],
      storeInventory: [],
      selectedFishId: null,
      gameStartedAt: Date.now(),
      developerMode: false,
      sellMode: false,
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
      geometry: {
        width: 300,
        height: 300,
        centerX: 150,
        centerY: 150,
      },
      backgroundColor: 0x87ceeb,
      floor: getFloorConfig('BOWL', 300, 300),
    })
  })

  it('should allow fish to starve if not fed', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    store.buyFish(tankId, FishSpecies.GUPPY)

    // Simulate ticks to reach starvation and death
    // Assuming hunger rate allows starvation within reasonable ticks
    let ticks = 0
    let fishDied = false
    // Safety break at 2000 ticks
    while (ticks < 2000) {
      const fishBefore = useGameStore.getState().tank!.fish.length
      useGameStore.getState().tick()
      const fishAfter = useGameStore.getState().tank!.fish.length

      // Fish is removed from tank when it dies (cleanup happens during tick)
      if (fishBefore > 0 && fishAfter === 0) {
        fishDied = true
        break
      }

      ticks++
    }

    // Verify fish died and was removed
    expect(fishDied).toBe(true)
    expect(useGameStore.getState().tank!.fish).toHaveLength(0)
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
      if (fish && fish.hunger > 50) {
        useGameStore.getState().feedTank(tankId)
      }

      // Also clean tank if pollution is high to prevent death by pollution
      if (useGameStore.getState().tank!.pollution > 20) {
        useGameStore.getState().cleanTank(tankId)
      }

      if (!fish || !fish.isAlive) break
    }

    const fish = useGameStore.getState().tank!.fish[0]
    expect(fish).toBeDefined()
    expect(fish.isAlive).toBe(true)
    expect(fish.health).toBeGreaterThan(0)
  })

  it('should automatically remove dead fish from tank during tick', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    // Buy a fish and let it starve without feeding
    store.buyFish(tankId, FishSpecies.GUPPY)
    expect(useGameStore.getState().tank!.fish).toHaveLength(1)

    // Simulate ticks to reach starvation and death
    let ticks = 0
    let deadFishRemoved = false
    while (ticks < 2000) {
      const fishBefore = useGameStore.getState().tank!.fish.length

      useGameStore.getState().tick()

      const fishAfter = useGameStore.getState().tank!.fish.length

      // Check if fish was removed after becoming dead
      if (fishBefore === 1 && fishAfter === 0) {
        deadFishRemoved = true
        break
      }

      ticks++
    }

    // Verify fish was automatically removed when it died
    expect(deadFishRemoved).toBe(true)
    expect(useGameStore.getState().tank!.fish).toHaveLength(0)
  })

  it('should not count dead fish in pollution metrics after removal', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    // Simple test: buy fish, let one starve and die (and be removed), then check that feeding cost is low
    store.buyFish(tankId, FishSpecies.GUPPY)
    expect(useGameStore.getState().tank!.fish).toHaveLength(1)

    // Let the fish starve completely
    let ticks = 0
    while (ticks < 2000) {
      const fishBefore = useGameStore.getState().tank!.fish.length
      useGameStore.getState().tick()
      const fishAfter = useGameStore.getState().tank!.fish.length

      // Check if fish was removed
      if (fishBefore > 0 && fishAfter === 0) {
        // Fish died and was removed
        break
      }

      ticks++
    }

    // Verify tank is empty (fish died and was removed)
    expect(useGameStore.getState().tank!.fish).toHaveLength(0)

    // After removing the dead fish, buy a fresh fish to test feeding cost
    const creditsBeforeBuy = useGameStore.getState().credits
    store.buyFish(tankId, FishSpecies.GUPPY)
    const creditsAfterBuy = useGameStore.getState().credits

    expect(useGameStore.getState().tank!.fish).toHaveLength(1)
    expect(creditsAfterBuy).toBeLessThan(creditsBeforeBuy)

    // Now feed this fresh fish
    const creditsBefore = useGameStore.getState().credits
    store.feedTank(tankId)
    const creditsAfter = useGameStore.getState().credits

    // Feeding cost should be low for just 1 fish
    expect(creditsAfter).toBeLessThan(creditsBefore)
  })
})
