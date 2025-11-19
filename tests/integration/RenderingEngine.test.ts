import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RenderingEngine } from '../../src/game/RenderingEngine';
import { Tank } from '../../src/models/Tank';

// Mock PixiJS
vi.mock('pixi.js', async () => {
  const actual = await vi.importActual('pixi.js');
  return {
    ...actual,
    Application: class {
      stage = { addChild: vi.fn(), removeChild: vi.fn() };
      canvas = document.createElement('canvas');
      ticker = { add: vi.fn(), remove: vi.fn(), start: vi.fn(), stop: vi.fn(), destroy: vi.fn() };
      init = vi.fn().mockResolvedValue(undefined);
      destroy = vi.fn();
    },
    Container: class {
      addChild = vi.fn();
      removeChild = vi.fn();
      removeChildren = vi.fn();
    },
    Sprite: class {
      anchor = { set: vi.fn() };
    },
    Texture: { WHITE: {} },
  };
});

describe('RenderingEngine Integration', () => {
  let engine: RenderingEngine;

  beforeEach(async () => {
    engine = new RenderingEngine(800, 600, 0x000000);
    await engine.init(document.createElement('div'));
  });

  it('should initialize with tank', () => {
    expect(engine.tank).toBeInstanceOf(Tank);
    expect(engine.tank.width).toBe(800);
  });

  it('should spawn fish', () => {
    engine.spawnFish(5);
    expect(engine.tank.fish.length).toBe(5);
  });

  it('should update fish positions on tick', () => {
    engine.spawnFish(1);
    const fish = engine.tank.fish[0];
    fish.vx = 10;
    fish.vy = 0;
    (fish as any).friction = 0; // Disable friction for deterministic test

    const initialX = fish.x;

    // Simulate a tick (delta = 1)
    // We need to access the update method directly or simulate ticker
    // Assuming RenderingEngine has a public update method or we can trigger it
    // For now, let's assume we can call the update logic directly if exposed, 
    // or we test the effect if we can trigger the ticker callback.
    // Since ticker is mocked, we can't rely on auto-update.
    // Let's expose update method or assume it's public for testing/game loop.

    // If update is private, we might need to cast to any or expose it.
    // Let's assume we'll make it public for testing or use a specific method.
    engine.update(1);

    expect(fish.x).toBe(initialX + 10);
  });
});
