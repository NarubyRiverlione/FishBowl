import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RenderingEngine } from '../../src/game/engine/RenderingEngine'
import { TEST_VALUES } from '../config/testConstants'

// Mock PixiJS
vi.mock('pixi.js', async () => {
  const actual = await vi.importActual('pixi.js')
  return {
    ...actual,
    Application: class {
      stage = { addChild: vi.fn(), removeChild: vi.fn() }
      canvas = document.createElement('canvas')
      ticker = {
        add: vi.fn(),
        remove: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        destroy: vi.fn(),
        FPS: 60,
      }
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

describe('Performance Stress Test', () => {
  let engine: RenderingEngine

  beforeEach(async () => {
    engine = new RenderingEngine(800, 600, 0x000000)
    await engine.init(document.createElement('div'))
  })

  it('should handle 20 fish without crashing', () => {
    engine.spawnFish(TEST_VALUES.STRESS_TEST.BASIC_FISH_COUNT)
    expect(engine.tank.fish.length).toBe(TEST_VALUES.STRESS_TEST.BASIC_FISH_COUNT)

    // Simulate a few frames
    for (let i = 0; i < TEST_VALUES.STRESS_TEST.FRAME_COUNT; i++) {
      engine.update(1)
    }

    // If we got here without error, it passed the basic crash test
    expect(true).toBe(true)
  })

  it('should handle 50 fish (stress test)', () => {
    engine.spawnFish(TEST_VALUES.STRESS_TEST.FISH_COUNT)
    expect(engine.tank.fish.length).toBe(TEST_VALUES.STRESS_TEST.FISH_COUNT)

    const start = performance.now()
    // Simulate 60 frames (1 second at 60fps)
    for (let i = 0; i < TEST_VALUES.STRESS_TEST.FRAME_COUNT; i++) {
      engine.update(1)
    }
    const end = performance.now()

    // Check if 60 frames took less than a reasonable amount of time (e.g., 100ms for pure logic)
    // Note: This tests logic performance, not rendering performance since Pixi is mocked
    expect(end - start).toBeLessThan(TEST_VALUES.STRESS_TEST.MAX_FRAME_TIME)
  })
})
