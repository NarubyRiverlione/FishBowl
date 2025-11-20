import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GameLoopService } from '../../src/services/GameLoopService'

describe('GameLoopService', () => {
  let service: GameLoopService

  beforeEach(() => {
    vi.useFakeTimers()
    service = new GameLoopService()
  })

  afterEach(() => {
    service.stop()
    vi.useRealTimers()
  })

  it('should start and call callback', () => {
    const callback = vi.fn()
    service.setCallback(callback)
    service.start()
    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalled()
  })

  it('should stop calling callback when stopped', () => {
    const callback = vi.fn()
    service.setCallback(callback)
    service.start()
    service.stop()
    vi.advanceTimersByTime(1000)
    expect(callback).not.toHaveBeenCalled()
  })
})
