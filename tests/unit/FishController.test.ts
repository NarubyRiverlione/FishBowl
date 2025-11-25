import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Tank } from '../../src/models/Tank'
import { Fish } from '../../src/models/Fish'
import { FishController } from '../../src/game/controllers/FishController'
import { FishSpecies } from '../../src/models/types'
import type { IFishData } from '../../src/models/types'
import { TankContainer } from '../../src/game/views/TankContainer'

// Mock the FishRenderManager so we can observe calls to addFish/removeFish
vi.mock('../../src/game/managers/FishRenderManager', () => {
  class MockFishRenderManager {
    addFish: ReturnType<typeof vi.fn>
    removeFish: ReturnType<typeof vi.fn>
    constructor() {
      this.addFish = vi.fn()
      this.removeFish = vi.fn()
    }
  }
  return { FishRenderManager: MockFishRenderManager }
})

// Mock SpawnService to avoid side effects during tests
vi.mock('../../src/services/simulation/SpawnService', () => {
  class MockSpawnService {
    spawn: ReturnType<typeof vi.fn>
    constructor() {
      this.spawn = vi.fn()
    }
  }
  return { SpawnService: MockSpawnService }
})

describe('FishController', () => {
  let tank: Tank
  let controller: FishController

  beforeEach(() => {
    // create a deterministic tank size for predictable x/y ranges
    tank = new Tank(200, 100, 0xff0000)
    // Create controller with a minimal tankView stub (not used by mocked manager)
    const fakeTankView = {} as TankContainer
    controller = new FishController(tank, fakeTankView)
  })

  it('adds fish from store to tank and calls renderManager.addFish', () => {
    const storeFish: IFishData[] = [
      {
        id: 'fish-1',
        species: FishSpecies.GUPPY,
        color: '#00ff00',
        size: 1,
        age: 0,
        health: 100,
        hunger: 0,
        isAlive: true,
        genetics: {},
        createdAt: Date.now(),
        geometry: {
          position: { x: 50, y: 50 },
          velocity: { vx: 0, vy: 0 },
          radius: 10,
        },
      },
    ]

    // Ensure tank starts empty
    expect(tank.fish.length).toBe(0)

    controller.syncFish(storeFish)

    // Tank should now contain the new Fish model
    expect(tank.fish.length).toBe(1)
    const added = tank.fish[0]!
    expect(added.id).toBe('fish-1')
    expect(added.species).toBe('GUPPY')

    // The mocked manager's addFish should have been called once on the controller instance
    const instance = (
      controller as unknown as {
        renderManager: { addFish: ReturnType<typeof vi.fn>; removeFish: ReturnType<typeof vi.fn> }
      }
    ).renderManager
    expect(instance.addFish).toHaveBeenCalled()
  })

  it('removes fish not present in store and calls renderManager.removeFish', () => {
    // Seed tank with an existing Fish model
    const existing = {
      id: 'to-remove',
      species: FishSpecies.GUPPY,
      color: '#000',
      size: 1,
      age: 0,
      health: 100,
      hunger: 0,
      isAlive: true,
      genetics: {},
      createdAt: Date.now(),
      update: () => {},
    }
    tank.fish.push(existing as unknown as Fish)

    // Call sync with empty store to remove it
    controller.syncFish([])

    expect(tank.fish.find((f) => f.id === 'to-remove')).toBeUndefined()

    // Verify mocked removeFish was called on the controller instance
    const instance = (
      controller as unknown as {
        renderManager: { addFish: ReturnType<typeof vi.fn>; removeFish: ReturnType<typeof vi.fn> }
      }
    ).renderManager
    expect(instance.removeFish).toHaveBeenCalled()
  })
})
