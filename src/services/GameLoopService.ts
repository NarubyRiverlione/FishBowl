import { TICK_RATE_SECONDS, MILLISECONDS_PER_SECOND } from '../lib/constants'

export type TickCallback = () => void

export class GameLoopService {
  private intervalId: number | null = null
  private callback: TickCallback | null = null
  private tickRateMs: number

  constructor() {
    this.tickRateMs = TICK_RATE_SECONDS * MILLISECONDS_PER_SECOND
  }

  setCallback(callback: TickCallback) {
    this.callback = callback
  }

  start() {
    if (this.intervalId) return
    this.intervalId = window.setInterval(() => {
      if (this.callback) this.callback()
    }, this.tickRateMs)
  }

  stop() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  pause() {
    this.stop()
  }

  resume() {
    this.start()
  }
}
