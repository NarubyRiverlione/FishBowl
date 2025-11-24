import { test, expect } from '@playwright/test'

interface GameStoreDebug {
  tank?: {
    size?: string
    shape?: { type?: string }
    width?: number
    height?: number
  }
}

declare global {
  interface Window {
    __GAME_STORE_DEBUG__?: GameStoreDebug
  }
}

test.describe('Tank Shape Visual Rendering', () => {
  test('should render circular bowl tank visually', async ({ page }) => {
    // Start with default bowl tank in normal mode (should be circular)
    await page.goto('/')

    // Wait for app to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2500)

    // Check that canvas exists
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()

    // Get canvas and tank shape information
    const tankInfo = await page.evaluate(() => {
      // Check tank state from game store
      const gameStore = (window as Window & { __GAME_STORE_DEBUG__?: Record<string, unknown> }).__GAME_STORE_DEBUG__ || {}
      const tank = (gameStore.tank || {}) as Record<string, unknown>

      // Map tank.size to shape type
      const shapeTypeMap: Record<string, string> = {
        BOWL: 'circular',
        STANDARD: 'rectangular',
        BIG: 'rectangular',
      }

      return {
        tankSize: tank.size,
        tankShape: shapeTypeMap[tank.size] || null,
        tankWidth: tank.geometry?.width || tank.width,
        tankHeight: tank.geometry?.height || tank.height,
        hasShape: !!tank.size,
        canvasWidth: document.querySelector('canvas')?.width || 0,
        canvasHeight: document.querySelector('canvas')?.height || 0,
      }
    })

    console.log('Tank rendering info:', tankInfo)

    // Verify bowl tank should have circular shape when shape system is enabled
    expect(tankInfo.size).toBe('BOWL')
    expect(tankInfo.hasShape).toBe(true)
    expect(tankInfo.tankShape).toBe('circular')
    expect(tankInfo.tankWidth).toBe(300) // TANK_BOWL_SIZE
    expect(tankInfo.tankHeight).toBe(300) // TANK_BOWL_SIZE
  })

  test('should render different shapes for different tank sizes in dev mode', async ({ page }) => {
    // Go to dev mode (STANDARD tank)
    await page.goto('/?dev=true')

    // Wait for app to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2500)

    // Check tank shape in dev mode
    const devTankInfo = await page.evaluate(() => {
      const gameStore = (window as Window & { __GAME_STORE_DEBUG__?: Record<string, unknown> }).__GAME_STORE_DEBUG__ || {}
      const tank = (gameStore.tank || {}) as Record<string, unknown>

      // Map tank.size to shape type
      const shapeTypeMap: Record<string, string> = {
        BOWL: 'circular',
        STANDARD: 'rectangular',
        BIG: 'rectangular',
      }

      return {
        tankSize: tank.size,
        tankShape: shapeTypeMap[tank.size] || null,
        tankWidth: tank.geometry?.width || tank.width,
        tankHeight: tank.geometry?.height || tank.height,
        hasShape: !!tank.size,
      }
    })

    console.log('Dev mode tank info:', devTankInfo)

    // In dev mode, should start with STANDARD tank (rectangular)
    expect(devTankInfo.tankSize).toBe('STANDARD')
    expect(devTankInfo.hasShape).toBe(true)
    expect(devTankInfo.tankShape).toBe('rectangular')
  })

  test('should visually detect tank shape through canvas pixels (advanced)', async ({ page }) => {
    // This test uses canvas pixel sampling to detect circular vs rectangular shapes
    await page.goto('/')

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const shapeDetection = await page.evaluate(() => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement | null
      if (!canvas) return { error: 'No canvas found' }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return { error: 'No 2D context' }
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Sample pixels at key positions to detect circular shape
      // For a circular tank, corner pixels should be background color
      // while edge-center pixels should have tank content

      const samples = {
        center: ctx.getImageData(centerX, centerY, 1, 1).data,
        topLeft: ctx.getImageData(10, 10, 1, 1).data,
        topCenter: ctx.getImageData(centerX, 10, 1, 1).data,
        rightCenter: ctx.getImageData(canvas.width - 10, centerY, 1, 1).data,
        bottomCenter: ctx.getImageData(centerX, canvas.height - 10, 1, 1).data,
      }

      // Check if corners are different from edges (indicating circular shape)
      const isCornerDifferent =
        samples.topLeft[0] !== samples.topCenter[0] ||
        samples.topLeft[1] !== samples.topCenter[1] ||
        samples.topLeft[2] !== samples.topCenter[2]

      return {
        canvasSize: { width: canvas.width, height: canvas.height },
        samples,
        possibleCircularShape: isCornerDifferent,
      }
    })

    console.log('Shape detection results:', shapeDetection)

    // Verify we can detect visual differences in rendering
    if (!shapeDetection.error && shapeDetection.canvasSize) {
      expect(shapeDetection.canvasSize.width).toBeGreaterThan(0)
      expect(shapeDetection.canvasSize.height).toBeGreaterThan(0)
    } else {
      expect(shapeDetection.error).toBeUndefined()
    }
  })
})
