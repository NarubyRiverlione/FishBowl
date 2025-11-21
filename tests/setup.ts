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
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
  const pixi = require('pixi.js')
  const { Container, Sprite, Graphics } = pixi

  const makeEventable = (proto: any) => {
    if (proto.__pixiEventPatched) return
    proto.__pixiEventPatched = true

    proto.on = function (event: string, cb: (...args: any[]) => void) {
      // store handlers on instance
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.__events = this.__events || {}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.__events[event] = this.__events[event] || []
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.__events[event].push(cb)
      return this
    }

    proto.once = function (event: string, cb: (...args: any[]) => void) {
      const wrapper = (...args: any[]) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        cb(...args)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.__events[event] = (this.__events && this.__events[event])?.filter((fn: any) => fn !== wrapper)
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.on(event, wrapper)
      return this
    }

    proto.off = function (event: string, cb?: (...args: any[]) => void) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!this.__events || !this.__events[event]) return this
      if (!cb) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.__events[event] = []
        return this
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.__events[event] = this.__events[event].filter((fn: any) => fn !== cb)
      return this
    }

    proto.emit = function (event: string, ...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const handlers = this.__events && this.__events[event]
      if (!handlers || handlers.length === 0) return this
      // call handlers
      for (const h of handlers.slice()) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          h(...args)
        } catch (e) {
          // ignore
        }
      }
      return this
    }

    // ensure interactive property exists (no-op in tests)
    Object.defineProperty(proto, 'interactive', {
      get() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return !!this.__interactive
      },
      set(v: boolean) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.__interactive = !!v
      },
    })

    // buttonMode no-op
    Object.defineProperty(proto, 'buttonMode', {
      get() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return !!this.__buttonMode
      },
      set(v: boolean) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.__buttonMode = !!v
      },
    })
  }

  if (Container) makeEventable(Container.prototype)
  if (Sprite) makeEventable(Sprite.prototype)
  if (Graphics) makeEventable(Graphics.prototype)
} catch (err) {
  // If pixi isn't available in the test env, skip shim — tests will surface real errors later
  // eslint-disable-next-line no-console
  console.warn('Pixi shim not applied:', err && err.message)
}
