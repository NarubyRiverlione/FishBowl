import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Pixi.js test shim: ensure interactive/display objects support simple event handlers
// so units tests that create Containers/Sprites can attach handlers without a browser.
try {
  // Use dynamic import to avoid `require()` in ESM environments
  // top-level await is supported in the test environment
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore -- dynamic import of optional dev dependency
  const pixiModule = await import('pixi.js')
  const { Container, Sprite, Graphics } = pixiModule as {
    Container: { prototype: unknown }
    Sprite: { prototype: unknown }
    Graphics: { prototype: unknown }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const makeEventable = (proto: any) => {
    if (proto.__pixiEventPatched) return
    proto.__pixiEventPatched = true

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    proto.on = function (event: string, cb: (...args: any[]) => void) {
      // store handlers on instance
      this.__events = this.__events || {}
      this.__events[event] = this.__events[event] || []
      this.__events[event].push(cb)
      return this
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    proto.once = function (event: string, cb: (...args: any[]) => void) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wrapper = (...args: any[]) => {
        cb(...args)
        if (this.__events?.[event]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.__events[event] = this.__events[event].filter((fn: any) => fn !== wrapper)
        }
      }
      this.on(event, wrapper)
      return this
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    proto.off = function (event: string, cb?: (...args: any[]) => void) {
      if (!this.__events?.[event]) return this
      if (!cb) {
        this.__events[event] = []
        return this
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.__events[event] = this.__events[event].filter((fn: any) => fn !== cb)
      return this
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    proto.emit = function (event: string, ...args: any[]) {
      const handlers = this.__events?.[event]
      if (!handlers || handlers.length === 0) return this
      // call handlers
      for (const h of handlers.slice()) {
        try {
          h(...args)
        } catch {
          // ignore
        }
      }
      return this
    }

    // ensure interactive property exists (no-op in tests)
    Object.defineProperty(proto, 'interactive', {
      get() {
        return !!this.__interactive
      },
      set(v: boolean) {
        this.__interactive = !!v
      },
    })

    // buttonMode no-op
    Object.defineProperty(proto, 'buttonMode', {
      get() {
        return !!this.__buttonMode
      },
      set(v: boolean) {
        this.__buttonMode = !!v
      },
    })
  }

  if (Container) makeEventable(Container.prototype as Record<string, unknown>)
  if (Sprite) makeEventable(Sprite.prototype as Record<string, unknown>)
  if (Graphics) makeEventable(Graphics.prototype as Record<string, unknown>)
} catch (_err) {
  // If pixi isn't available in the test env, skip shim — tests will surface real errors later
  console.warn('Pixi shim not applied:', (_err as Error)?.message || _err)
}
