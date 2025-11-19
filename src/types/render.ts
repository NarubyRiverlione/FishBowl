import { Application, Container, Sprite } from 'pixi.js'

/**
 * Context for the PixiJS application.
 */
export interface IRenderContext {
  app: Application
  stage: Container
}

/**
 * Interface for objects that can be updated each frame.
 */
export interface IUpdatable {
  update(delta: number): void
}

/**
 * Interface for objects that can be rendered.
 */
export interface IRenderable {
  container: Container | Sprite
}
