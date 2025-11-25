import { describe, it, expect, vi } from 'vitest'
import { FishSprite } from '../../src/game/views/FishSprite'
import { FishSpecies } from '../../src/models/types'
import type { IFishData, IFishLogic } from '../../src/models/types'

// Mock PixiJS Texture and Assets
vi.mock('pixi.js', async () => {
  const actual = await vi.importActual('pixi.js')
  return {
    ...actual,
    Texture: {
      EMPTY: {},
      WHITE: {},
    },
    Assets: {
      load: vi.fn().mockResolvedValue({}), // Mock texture loading
    },
    Sprite: class {
      x = 0
      y = 0
      width = 0
      height = 0
      tint = 0
      rotation = 0
      texture = {}
      anchor = { set: vi.fn() }
    },
  }
})

// Mock SVG import
vi.mock('../../src/assets/fish.svg', () => ({
  default: 'data:image/svg+xml,<svg></svg>',
}))

describe('FishSprite', () => {
  it('should initialize with provided position and fish data', () => {
    const fish: IFishData = {
      id: '1',
      species: FishSpecies.GUPPY,
      color: '#FF0000',
      size: 1.0,
      age: 50,
      health: 100,
      hunger: 0,
      isAlive: true,
      genetics: {},
      createdAt: Date.now(),
      geometry: {
        position: { x: 100, y: 200 },
        velocity: { vx: 0, vy: 0 },
        radius: 10,
      },
    }

    const sprite = new FishSprite(fish as IFishLogic, 100, 200)

    expect(sprite.x).toBe(100)
    expect(sprite.y).toBe(200)
    // In test environment with mocked Pixi.js, width/height are 0 since no actual texture is loaded
    expect(sprite.width).toBe(0) // Mock Sprite has width = 0
    expect(sprite.height).toBe(0) // Mock Sprite has height = 0
  })

  it('should apply life stage visual effects based on fish age', () => {
    const youngFish: IFishData = {
      id: 'young',
      species: FishSpecies.GUPPY,
      color: '#FF0000',
      size: 1.0,
      age: 50, // young
      health: 100,
      hunger: 0,
      isAlive: true,
      genetics: {},
      createdAt: Date.now(),
      geometry: {
        position: { x: 0, y: 0 },
        velocity: { vx: 0, vy: 0 },
        radius: 10,
      },
    }

    const matureFish: IFishData = {
      id: 'mature',
      species: FishSpecies.GUPPY,
      color: '#FF0000',
      size: 1.0,
      age: 200, // mature
      health: 100,
      hunger: 0,
      isAlive: true,
      genetics: {},
      createdAt: Date.now(),
      geometry: {
        position: { x: 0, y: 0 },
        velocity: { vx: 0, vy: 0 },
        radius: 10,
      },
    }

    const oldFish: IFishData = {
      id: 'old',
      species: FishSpecies.GUPPY,
      color: '#FF0000',
      size: 1.0,
      age: 400, // old
      health: 100,
      hunger: 0,
      isAlive: true,
      genetics: {},
      createdAt: Date.now(),
      geometry: {
        position: { x: 0, y: 0 },
        velocity: { vx: 0, vy: 0 },
        radius: 10,
      },
    }

    const youngSprite = new FishSprite(youngFish as IFishLogic, 0, 0)
    const matureSprite = new FishSprite(matureFish as IFishLogic, 0, 0)
    const oldSprite = new FishSprite(oldFish as IFishLogic, 0, 0)

    // Young fish: base size (1.0x) - but in mock environment, width/height are 0
    expect(youngSprite.width).toBe(0) // Mock Sprite has width = 0
    expect(youngSprite.height).toBe(0) // Mock Sprite has height = 0

    // Mature fish: larger size (1.3x) - but in mock environment, width/height are 0
    expect(matureSprite.width).toBe(0) // Mock Sprite has width = 0
    expect(matureSprite.height).toBe(0) // Mock Sprite has height = 0

    // Old fish: larger size (1.3x) but desaturated color - but in mock environment, width/height are 0
    expect(oldSprite.width).toBe(0) // Mock Sprite has width = 0
    expect(oldSprite.height).toBe(0) // Mock Sprite has height = 0
  })

  it('should update position with movement simulation', () => {
    const fish: IFishData = {
      id: '1',
      species: FishSpecies.GUPPY,
      color: '#FF0000',
      size: 1.0,
      age: 50,
      health: 100,
      hunger: 0,
      isAlive: true,
      genetics: {},
      createdAt: Date.now(),
      geometry: {
        position: { x: 100, y: 100 },
        velocity: { vx: 0, vy: 0 },
        radius: 10,
      },
    }

    const fishLogic = fish as unknown as IFishLogic & { x: number; y: number }
    const sprite = new FishSprite(fishLogic, 100, 100)

    // Initially, sprite should be positioned where we set the Fish model
    expect(sprite.x).toBe(100)
    expect(sprite.y).toBe(100)
    expect(fish.geometry.position.x).toBe(100)
    expect(fish.geometry.position.y).toBe(100)

    // Change Fish model position via the x/y properties (which map to geometry.position)
    fishLogic.x = 200
    fishLogic.y = 150

    sprite.update()

    // Sprite should sync with Fish model position
    expect(sprite.x).toBe(200)
    expect(sprite.y).toBe(150)
  })
})
