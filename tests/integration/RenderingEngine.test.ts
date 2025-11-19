import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RenderingEngine } from '../../src/game/RenderingEngine'
import { Tank } from '../../src/models/Tank'

// Mock PixiJS
vi.mock('pixi.js', async () => {
  const actual = await vi.importActual('pixi.js')
  return {
    ...actual,
    Application: class {
      stage = { addChild: vi.fn(), removeChild: vi.fn() }
      canvas = document.createElement('canvas')
      ticker = { add: vi.fn(), remove: vi.fn(), start: vi.fn(), stop: vi.fn(), destroy: vi.fn() }
      init = vi.fn().mockResolvedValue(undefined)
      destroy = vi.fn()
    },
    Container: class {
      addChild = vi.fn()
      removeChild = vi.fn()
      removeChildren = vi.fn()
    },
    Sprite: class {
      anchor = { set: vi.fn() }
    },
    Texture: { WHITE: {} },
  }
})

describe('RenderingEngine Integration', () => {
  let engine: RenderingEngine

  beforeEach(async () => {
    engine = new RenderingEngine(800, 600, 0x000000)
    await engine.init(document.createElement('div'))
  })

  it('should initialize with tank', () => {
    expect(engine.tank).toBeInstanceOf(Tank)
    expect(engine.tank.width).toBe(800)
  })

  it('should spawn fish', () => {
    engine.spawnFish(5)
    expect(engine.tank.fish.length).toBe(5)
  })

  it('should update fish positions on tick', () => {
    engine.spawnFish(1)
    const fish = engine.tank.fish[0]
    fish.vx = 10
    fish.vy = 0

    const initialX = fish.x

    // Simulate a tick (delta = 1)
    engine.update(1)

    // With swim behavior, the position will be affected by random forces
    // So we just check that the fish moved forward (x increased)
    expect(fish.x).toBeGreaterThan(initialX)
  })

  it('should spawn fish with varied colors and sizes', () => {
    engine.spawnFish(20)
    const fish = engine.tank.fish

    const colors = new Set(fish.map((f) => f.color))
    const sizes = new Set(fish.map((f) => f.scale))

    expect(colors.size).toBeGreaterThan(1)
    expect(sizes.size).toBeGreaterThan(1)
  })

  it('should log metrics after update', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    engine.spawnFish(5)

    // Update and wait for metric logging interval
    engine.update(1)
    await new Promise((resolve) => setTimeout(resolve, 1100))
    engine.update(1)

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('FPS:'))
    consoleSpy.mockRestore()
  })

  it('should handle destroy without errors', () => {
    expect(() => engine.destroy()).not.toThrow()
  })
})
