import { Sprite, Texture } from 'pixi.js';
import { IFish } from '../types/fish';

export class FishSprite extends Sprite {
  private fish: IFish;

  constructor(fish: IFish) {
    super(Texture.WHITE); // Placeholder texture
    this.fish = fish;

    this.width = fish.width;
    this.height = fish.height;
    this.tint = parseInt(fish.color.replace('#', ''), 16);
    this.anchor.set(0.5); // Center anchor

    this.update();
  }

  update(): void {
    this.x = this.fish.x;
    this.y = this.fish.y;

    // Rotate based on velocity
    if (this.fish.vx !== 0 || this.fish.vy !== 0) {
      this.rotation = Math.atan2(this.fish.vy, this.fish.vx);
    }
  }
}
