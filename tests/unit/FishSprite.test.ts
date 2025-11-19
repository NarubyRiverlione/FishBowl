import { describe, it, expect, vi } from 'vitest'
import { FishSprite } from '../../src/game/FishSprite'
import { Fish } from '../../src/models/Fish'

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
  it('should initialize from fish model', () => {
    const fish = new Fish('1', 100, 200)
    fish.color = '#FF0000'
    fish.width = 32
    fish.height = 16

    const sprite = new FishSprite(fish)

    expect(sprite.x).toBe(100)
    expect(sprite.y).toBe(200)
    expect(sprite.width).toBe(32)
    expect(sprite.height).toBe(16)
  })

  it('should update position from fish model', () => {
    const fish = new Fish('1', 0, 0)
    const sprite = new FishSprite(fish)

    fish.x = 50
    fish.y = 75
    fish.vx = 10
    fish.vy = 5

    sprite.update()

    expect(sprite.x).toBe(50)
    expect(sprite.y).toBe(75)
    // Rotation should be set based on velocity
    expect(sprite.rotation).toBeCloseTo(Math.atan2(5, 10))
  })

  it('should handle rotation when fish has velocity', () => {
    const fish = new Fish('1', 100, 100)
    fish.vx = -5
    fish.vy = 5
    const sprite = new FishSprite(fish)

    sprite.update()

    // Should rotate to face direction of movement
    const expectedRotation = Math.atan2(5, -5)
    expect(sprite.rotation).toBeCloseTo(expectedRotation)
  })
})
