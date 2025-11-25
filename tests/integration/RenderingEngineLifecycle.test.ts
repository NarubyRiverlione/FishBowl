import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { RenderingEngineManager } from '../../src/game/managers/RenderingEngineManager'
import { RenderingEngine } from '../../src/game/engine/RenderingEngine'

describe('RenderingEngineLifecycle Integration', () => {
  beforeEach(() => {
    RenderingEngineManager.reset()
  })

  afterEach(() => {
    RenderingEngineManager.reset()
  })

  it('should create a single rendering engine instance', () => {
    const stats = RenderingEngineManager.getInstanceStats()
    expect(stats.hasInstance).toBe(false)
    expect(stats.totalInstancesCreated).toBe(0)

    const engine = RenderingEngineManager.getInstance(800, 600, 0x006994)
    expect(engine).toBeInstanceOf(RenderingEngine)

    const statsAfter = RenderingEngineManager.getInstanceStats()
    expect(statsAfter.hasInstance).toBe(true)
    expect(statsAfter.totalInstancesCreated).toBe(1)
    expect(statsAfter.instanceId).toBeDefined()
  })

  it('should return the same instance on subsequent calls', () => {
    const engine1 = RenderingEngineManager.getInstance(800, 600, 0x006994)
    const engine2 = RenderingEngineManager.getInstance(800, 600, 0x006994)

    // Both should be the same instance (manager doesn't create new one if one exists)
    expect(engine1).toBe(engine2)

    const stats = RenderingEngineManager.getInstanceStats()
    expect(stats.totalInstancesCreated).toBe(1)
  })

  it('should destroy previous instance when creating a new one with different dimensions', () => {
    const engine1 = RenderingEngineManager.getInstance(800, 600, 0x006994)
    const id1 = RenderingEngineManager.getCurrentInstanceId()

    // Creating another instance should destroy the first
    const engine2 = RenderingEngineManager.getInstance(1024, 768, 0x006994)
    const id2 = RenderingEngineManager.getCurrentInstanceId()

    expect(id1).not.toEqual(id2)
    expect(engine1).not.toBe(engine2)

    const stats = RenderingEngineManager.getInstanceStats()
    expect(stats.totalInstancesCreated).toBe(2)
  })

  it('should properly clean up instance on destroy', () => {
    RenderingEngineManager.getInstance(800, 600, 0x006994)
    expect(RenderingEngineManager.hasActiveInstance()).toBe(true)

    RenderingEngineManager.destroyInstance()
    expect(RenderingEngineManager.hasActiveInstance()).toBe(false)
    expect(RenderingEngineManager.getCurrentInstance()).toBeNull()
    expect(RenderingEngineManager.getCurrentInstanceId()).toBeNull()
  })

  it('should handle multiple create-destroy cycles', () => {
    for (let i = 0; i < 3; i++) {
      RenderingEngineManager.getInstance(800, 600, 0x006994)
      expect(RenderingEngineManager.hasActiveInstance()).toBe(true)

      RenderingEngineManager.destroyInstance()
      expect(RenderingEngineManager.hasActiveInstance()).toBe(false)
    }

    const stats = RenderingEngineManager.getInstanceStats()
    expect(stats.totalInstancesCreated).toBe(3)
    expect(stats.hasInstance).toBe(false)
  })

  it('should not throw errors during cleanup of non-existent instance', () => {
    expect(() => {
      RenderingEngineManager.destroyInstance()
    }).not.toThrow()

    expect(RenderingEngineManager.hasActiveInstance()).toBe(false)
  })

  it('should reset manager state completely', () => {
    RenderingEngineManager.getInstance(800, 600, 0x006994)
    expect(RenderingEngineManager.hasActiveInstance()).toBe(true)

    RenderingEngineManager.reset()

    expect(RenderingEngineManager.hasActiveInstance()).toBe(false)
    expect(RenderingEngineManager.getCurrentInstance()).toBeNull()
    expect(RenderingEngineManager.getCurrentInstanceId()).toBeNull()

    const stats = RenderingEngineManager.getInstanceStats()
    expect(stats.hasInstance).toBe(false)
    expect(stats.totalInstancesCreated).toBe(0)
  })

  it('should provide instance statistics for monitoring', () => {
    const statsInitial = RenderingEngineManager.getInstanceStats()
    expect(statsInitial.hasInstance).toBe(false)
    expect(statsInitial.totalInstancesCreated).toBe(0)
    expect(statsInitial.instanceId).toBeNull()

    RenderingEngineManager.getInstance(800, 600, 0x006994)
    const statsAfterCreate = RenderingEngineManager.getInstanceStats()
    expect(statsAfterCreate.hasInstance).toBe(true)
    expect(statsAfterCreate.totalInstancesCreated).toBe(1)
    expect(statsAfterCreate.instanceId).toMatch(/^engine-/)
  })

  it('should prevent concurrent instance creation race conditions', () => {
    const engine1 = RenderingEngineManager.getInstance(800, 600, 0x006994)
    const engine2 = RenderingEngineManager.getInstance(800, 600, 0x006994)

    // Both calls should get the same instance (no race condition)
    expect(engine1).toBe(engine2)

    const stats = RenderingEngineManager.getInstanceStats()
    expect(stats.totalInstancesCreated).toBe(1)
  })
})
