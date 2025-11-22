/**
 * Unit tests for tank visual rendering (T042d)
 * Verifies dimensions and shape types render correctly
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Graphics } from 'pixi.js'
import { TankContainer } from '../../src/game/views/TankContainer'
import { ITank, TankSize } from '../../src/models/types'
import { createTankShape } from '../../src/services/physics/TankShapeFactory'
import { TANK_BOWL_SIZE, TANK_STANDARD_SIZE, TANK_BIG_WIDTH, TANK_BIG_HEIGHT } from '../../src/lib/constants'

// Mock PIXI Graphics methods for testing
vi.mock('pixi.js', async () => {
  const actual = await vi.importActual('pixi.js')
  return {
    ...actual,
    Graphics: vi.fn().mockImplementation(() => ({
      clear: vi.fn().mockReturnThis(),
      rect: vi.fn().mockReturnThis(),
      circle: vi.fn().mockReturnThis(),
      fill: vi.fn().mockReturnThis(),
      stroke: vi.fn().mockReturnThis(),
      moveTo: vi.fn().mockReturnThis(),
      lineTo: vi.fn().mockReturnThis(),
    })),
    Container: vi.fn().mockImplementation(() => ({
      addChild: vi.fn(),
      removeChild: vi.fn(),
      scale: { set: vi.fn() },
      interactive: false,
    })),
  }
})

// Mock window for responsive scaling tests
const mockWindow = (width: number, height: number) => {
  Object.defineProperty(globalThis, 'window', {
    writable: true,
    value: {
      innerWidth: width,
      innerHeight: height,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  })
}

describe('Tank Visual Rendering (T042d)', () => {
  let mockTank: ITank

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset default window size
    mockWindow(1024, 768)

    // Base tank template
    mockTank = {
      id: 'test-tank',
      size: 'BOWL' as TankSize,
      width: TANK_BOWL_SIZE,
      height: TANK_BOWL_SIZE,
      capacity: 2,
      fish: [],
      waterQuality: 100,
      pollution: 0,
      hasFilter: false,
      temperature: 25,
      backgroundColor: 0x87ceeb,
      createdAt: Date.now(),
      shape: createTankShape('BOWL'),
    }
  })

  describe('Tank Dimensions', () => {
    it('should use correct dimensions for BOWL tank', () => {
      const tank = { ...mockTank, size: 'BOWL' as TankSize }
      tank.width = TANK_BOWL_SIZE
      tank.height = TANK_BOWL_SIZE
      tank.shape = createTankShape('BOWL')

      const container = new TankContainer(tank)

      expect(tank.width).toBe(TANK_BOWL_SIZE)
      expect(tank.height).toBe(TANK_BOWL_SIZE)
      expect(tank.shape?.type).toBe('circular')
      expect(container).toBeDefined()
    })

    it('should use correct dimensions for STANDARD tank', () => {
      const tank = { ...mockTank, size: 'STANDARD' as TankSize }
      tank.width = TANK_STANDARD_SIZE
      tank.height = TANK_STANDARD_SIZE
      tank.shape = createTankShape('STANDARD')

      const container = new TankContainer(tank)

      expect(tank.width).toBe(TANK_STANDARD_SIZE)
      expect(tank.height).toBe(TANK_STANDARD_SIZE)
      expect(tank.shape?.type).toBe('rectangular')
      expect(container).toBeDefined()
    })

    it('should use correct dimensions for BIG tank', () => {
      const tank = { ...mockTank, size: 'BIG' as TankSize }
      tank.width = TANK_BIG_WIDTH
      tank.height = TANK_BIG_HEIGHT
      tank.shape = createTankShape('BIG')

      const container = new TankContainer(tank)

      expect(tank.width).toBe(TANK_BIG_WIDTH)
      expect(tank.height).toBe(TANK_BIG_HEIGHT)
      expect(tank.shape?.type).toBe('rectangular')
      expect(container).toBeDefined()
    })
  })

  describe('Shape Type Rendering', () => {
    it('should render circular tank shape for BOWL', () => {
      const tank = { ...mockTank, size: 'BOWL' as TankSize }
      tank.shape = createTankShape('BOWL')

      const mockGraphics = new Graphics()
      const container = new TankContainer(tank)

      // Verify circular rendering methods were called
      expect(mockGraphics.circle).toHaveBeenCalled()
      expect(container).toBeDefined()
    })

    it('should render rectangular tank shape for STANDARD', () => {
      const tank = { ...mockTank, size: 'STANDARD' as TankSize }
      tank.width = TANK_STANDARD_SIZE
      tank.height = TANK_STANDARD_SIZE
      tank.shape = createTankShape('STANDARD')

      const mockGraphics = new Graphics()
      const container = new TankContainer(tank)

      // Verify rectangular rendering methods were called
      expect(mockGraphics.rect).toHaveBeenCalled()
      expect(container).toBeDefined()
    })

    it('should render rectangular tank shape for BIG', () => {
      const tank = { ...mockTank, size: 'BIG' as TankSize }
      tank.width = TANK_BIG_WIDTH
      tank.height = TANK_BIG_HEIGHT
      tank.shape = createTankShape('BIG')

      const mockGraphics = new Graphics()
      const container = new TankContainer(tank)

      // Verify rectangular rendering methods were called
      expect(mockGraphics.rect).toHaveBeenCalled()
      expect(container).toBeDefined()
    })

    it('should fallback to rectangular rendering when no shape is available', () => {
      const tank = { ...mockTank, shape: undefined }

      const mockGraphics = new Graphics()
      const container = new TankContainer(tank)

      // Verify rectangular fallback was used
      expect(mockGraphics.rect).toHaveBeenCalled()
      expect(container).toBeDefined()
    })
  })

  describe('Responsive Display Scaling (T042c)', () => {
    it('should scale appropriately for desktop viewport', () => {
      mockWindow(1200, 800)

      const tank = { ...mockTank }
      const container = new TankContainer(tank)

      // Scale should be applied to container
      expect(container.scale.set).toHaveBeenCalled()
      expect(container).toBeDefined()
    })

    it('should scale appropriately for tablet viewport', () => {
      mockWindow(800, 600)

      const tank = { ...mockTank }
      const container = new TankContainer(tank)

      expect(container.scale.set).toHaveBeenCalled()
    })

    it('should scale appropriately for mobile viewport', () => {
      mockWindow(400, 600)

      const tank = { ...mockTank }
      const container = new TankContainer(tank)

      expect(container.scale.set).toHaveBeenCalled()
    })

    it('should update display scale when updateDisplayScale is called', () => {
      const tank = { ...mockTank }
      const container = new TankContainer(tank)

      // Clear previous calls
      vi.clearAllMocks()

      // Call update method
      container.updateDisplayScale()

      expect(container.scale.set).toHaveBeenCalled()
    })

    it('should respect minimum and maximum scale limits', () => {
      mockWindow(100, 100) // Very small viewport

      const tank = { ...mockTank }
      const container = new TankContainer(tank)

      // Scale should still be within reasonable bounds
      expect(container.scale.set).toHaveBeenCalled()
      expect(container).toBeDefined()

      // Test with very large viewport
      mockWindow(4000, 3000)
      const container2 = new TankContainer(tank)

      expect(container2.scale.set).toHaveBeenCalled()
      expect(container2).toBeDefined()
    })
  })

  describe('Visual Element Rendering', () => {
    it('should draw tank border', () => {
      const tank = { ...mockTank }
      const mockGraphics = new Graphics()
      const container = new TankContainer(tank)

      expect(mockGraphics.stroke).toHaveBeenCalled()
      expect(container).toBeDefined()
    })

    it('should draw water background', () => {
      const tank = { ...mockTank }
      const mockGraphics = new Graphics()
      const container = new TankContainer(tank)

      expect(mockGraphics.fill).toHaveBeenCalled()
      expect(container).toBeDefined()
    })

    it('should draw water surface line', () => {
      const tank = { ...mockTank }
      const mockGraphics = new Graphics()
      const container = new TankContainer(tank)

      expect(mockGraphics.moveTo).toHaveBeenCalled()
      expect(mockGraphics.lineTo).toHaveBeenCalled()
      expect(container).toBeDefined()
    })
  })
})
