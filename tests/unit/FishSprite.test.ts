import { describe, it, expect, vi } from 'vitest';
import { FishSprite } from '../../src/game/FishSprite';
import { Fish } from '../../src/models/Fish';
import { Texture } from 'pixi.js';

// Mock PixiJS Texture
vi.mock('pixi.js', async () => {
  const actual = await vi.importActual('pixi.js');
  return {
    ...actual,
    Texture: {
      WHITE: {},
    },
    Sprite: class {
      x = 0;
      y = 0;
      width = 0;
      height = 0;
      tint = 0;
      anchor = { set: vi.fn() };
    },
  };
});

describe('FishSprite', () => {
  it('should initialize from fish model', () => {
    const fish = new Fish('1', 100, 200);
    fish.color = '#FF0000';
    fish.width = 32;
    fish.height = 16;

    const sprite = new FishSprite(fish);

    expect(sprite.x).toBe(100);
    expect(sprite.y).toBe(200);
    expect(sprite.width).toBe(32);
    expect(sprite.height).toBe(16);
    // Pixi uses number for tint, so we'd expect the hex number
    // But since we mock Sprite, we check if it set properties correctly
  });

  it('should update position from fish model', () => {
    const fish = new Fish('1', 0, 0);
    const sprite = new FishSprite(fish);

    fish.x = 50;
    fish.y = 60;
    sprite.update();

    expect(sprite.x).toBe(50);
    expect(sprite.y).toBe(60);
  });
});
