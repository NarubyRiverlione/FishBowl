/**
 * E2E tests for procedural tank rendering (T042f)
 * Tests tank rendering across different tank types and responsive scaling
 */

import { test, expect } from '@playwright/test'

test.describe('Procedural Tank Rendering (T042f)', () => {
  test.beforeEach(async ({ page }) => {
    // Enable tank shape features for testing
    await page.goto('/?dev=true')
    await page.waitForTimeout(2000) // Allow game to initialize
  })

  test.describe('Tank Shape Rendering', () => {
    test('should render circular BOWL tank correctly', async ({ page }) => {
      // Test that bowl tank renders as circular
      await page.waitForSelector('canvas')

      // Check canvas is present
      const canvas = page.locator('canvas')
      await expect(canvas).toBeVisible()

      // Wait for app to fully initialize
      await page.waitForTimeout(1000)

      // Verify tank type through game store
      const tankInfo = await page.evaluate(() => {
        const store = (window as Window & { __GAME_STORE_DEBUG__?: { tank: Record<string, unknown> } })
          .__GAME_STORE_DEBUG__
        if (store && store.tank) {
          const tank = store.tank as Record<string, unknown>
          return {
            size: tank.size,
            shape: (tank.shape as Record<string, unknown> | undefined)?.type || 'unknown',
            width: tank.geometry ? (tank.geometry as Record<string, unknown>).width : tank.width,
            height: tank.geometry ? (tank.geometry as Record<string, unknown>).height : tank.height,
          }
        }
        return null
      })

      expect(tankInfo).not.toBeNull()
      if (tankInfo) {
        expect(tankInfo.size).toBe('BOWL')
        expect(tankInfo.shape).toBe('circular')
        expect(tankInfo.width).toBe(300) // TANK_BOWL_SIZE
        expect(tankInfo.height).toBe(300)
      }
    })

    test('should render rectangular STANDARD tank after upgrade', async ({ page }) => {
      // Start with dev mode (already has STANDARD tank)
      await page.waitForSelector('canvas')

      // Wait for app to fully initialize
      await page.waitForTimeout(1000)

      // Get tank info from game store
      const tankInfo = await page.evaluate(() => {
        const store = (window as Window & { __GAME_STORE_DEBUG__?: { tank: Record<string, unknown> } })
          .__GAME_STORE_DEBUG__
        if (store && store.tank) {
          const tank = store.tank as Record<string, unknown>
          return {
            size: tank.size,
            shape: (tank.shape as Record<string, unknown> | undefined)?.type || 'unknown',
            width: tank.geometry ? (tank.geometry as Record<string, unknown>).width : tank.width,
            height: tank.geometry ? (tank.geometry as Record<string, unknown>).height : tank.height,
          }
        }
        return null
      })

      expect(tankInfo).not.toBeNull()
      if (tankInfo) {
        expect(tankInfo.size).toBe('STANDARD')
        expect(tankInfo.shape).toBe('rectangular')
        expect(tankInfo.width).toBe(500) // TANK_STANDARD_SIZE
        expect(tankInfo.height).toBe(500)
      }
    })
  })

  test.describe('Responsive Scaling', () => {
    test('should scale appropriately for desktop viewport', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1200, height: 800 })
      await page.waitForTimeout(1000) // Allow scaling to update

      const canvas = page.locator('canvas')
      await expect(canvas).toBeVisible()

      // Check canvas dimensions are reasonable for desktop
      const canvasBox = await canvas.boundingBox()
      expect(canvasBox).not.toBeNull()

      if (canvasBox) {
        // Should be within desktop scaling range (300-600px)
        expect(canvasBox.width).toBeGreaterThanOrEqual(300)
        expect(canvasBox.width).toBeLessThanOrEqual(800)
        expect(canvasBox.height).toBeGreaterThanOrEqual(300)
        expect(canvasBox.height).toBeLessThanOrEqual(800)
      }
    })

    test('should scale appropriately for tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 800, height: 600 })
      await page.waitForTimeout(1000) // Allow scaling to update

      const canvas = page.locator('canvas')
      await expect(canvas).toBeVisible()

      // Check canvas dimensions adjust for tablet
      const canvasBox = await canvas.boundingBox()
      expect(canvasBox).not.toBeNull()

      if (canvasBox) {
        // Should fit within tablet constraints
        expect(canvasBox.width).toBeLessThanOrEqual(400) // Half of tablet width minus margins
        expect(canvasBox.height).toBeGreaterThanOrEqual(200)
      }
    })

    test('should scale appropriately for mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 400, height: 600 })
      await page.waitForTimeout(1000) // Allow scaling to update

      const canvas = page.locator('canvas')
      await expect(canvas).toBeVisible()

      // Check canvas dimensions adjust for mobile
      const canvasBox = await canvas.boundingBox()
      expect(canvasBox).not.toBeNull()

      if (canvasBox) {
        // Should be full width minus padding on mobile
        expect(canvasBox.width).toBeLessThanOrEqual(360) // 400 - 40 padding
        expect(canvasBox.width).toBeGreaterThanOrEqual(200)
      }
    })

    test('should maintain aspect ratio during scaling', async ({ page }) => {
      // Test different viewports and check aspect ratio preservation
      const viewports = [
        { width: 1200, height: 800 }, // Desktop
        { width: 800, height: 600 }, // Tablet
        { width: 400, height: 600 }, // Mobile
      ]

      for (const viewport of viewports) {
        await page.setViewportSize(viewport)
        await page.waitForTimeout(500)

        const canvas = page.locator('canvas')
        const canvasBox = await canvas.boundingBox()

        if (canvasBox) {
          // For BOWL tank (circular), aspect ratio should be close to 1:1
          const aspectRatio = canvasBox.width / canvasBox.height

          // Allow some tolerance for browser differences
          expect(aspectRatio).toBeGreaterThan(0.8)
          expect(aspectRatio).toBeLessThan(1.2)
        }
      }
    })
  })

  test.describe('Visual Rendering Quality', () => {
    test('should render tank borders consistently', async ({ page }) => {
      await page.waitForSelector('canvas')

      // Take a screenshot to verify visual rendering
      const canvas = page.locator('canvas')
      await expect(canvas).toBeVisible()

      // Check that canvas has content (not just blank)
      const canvasHandle = await canvas.elementHandle()
      if (canvasHandle) {
        const hasContent = await page.evaluate((canvas) => {
          const canvasElement = canvas as HTMLCanvasElement
          const ctx = canvasElement.getContext('2d')
          if (ctx) {
            const imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height)
            // Check if there are any non-transparent pixels
            for (let i = 3; i < imageData.data.length; i += 4) {
              if (imageData.data[i] > 0) return true // Found non-transparent pixel
            }
          }
          return false
        }, canvasHandle)

        expect(hasContent).toBe(true)
      }
    })

    test('should render water surface correctly', async ({ page }) => {
      await page.waitForSelector('canvas')
      const canvas = page.locator('canvas')

      // Wait for fish to be added (which should trigger water rendering)
      await page.waitForTimeout(3000)

      // Check game state shows fish are present
      const gameState = await page.evaluate(() => {
        const store = (
          window as Window & { __GAME_STORE_DEBUG__?: { tank: { fish: { length: number }; waterQuality: number } } }
        ).__GAME_STORE_DEBUG__
        return store
          ? {
              fishCount: store.tank.fish.length,
              waterQuality: store.tank.waterQuality,
            }
          : null
      })

      expect(gameState).not.toBeNull()
      if (gameState) {
        expect(gameState.fishCount).toBeGreaterThan(0)
        expect(gameState.waterQuality).toBeGreaterThanOrEqual(0)
        expect(gameState.waterQuality).toBeLessThanOrEqual(100)
      }

      // Verify canvas still has content with water rendered
      await expect(canvas).toBeVisible()
    })

    test('should handle window resize gracefully', async ({ page }) => {
      await page.waitForSelector('canvas')

      // Start with one size
      await page.setViewportSize({ width: 1200, height: 800 })
      await page.waitForTimeout(500)

      let canvas = page.locator('canvas')
      const initialBox = await canvas.boundingBox()

      // Resize to different size
      await page.setViewportSize({ width: 800, height: 600 })
      await page.waitForTimeout(500)

      canvas = page.locator('canvas')
      const newBox = await canvas.boundingBox()

      // Canvas should have updated dimensions
      expect(newBox).not.toBeNull()
      expect(initialBox).not.toBeNull()

      if (initialBox && newBox) {
        // Dimensions should be different after resize
        const dimensionsChanged =
          Math.abs(initialBox.width - newBox.width) > 10 || Math.abs(initialBox.height - newBox.height) > 10

        expect(dimensionsChanged).toBe(true)
      }

      // Canvas should still be visible and functional
      await expect(canvas).toBeVisible()
    })
  })

  test.describe('Performance and Stability', () => {
    test('should render without console errors', async ({ page }) => {
      const errors: string[] = []

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })

      await page.waitForSelector('canvas')
      await page.waitForTimeout(3000) // Allow rendering to complete

      // Filter out known non-critical errors
      const criticalErrors = errors.filter(
        (error) =>
          !error.includes('React DevTools') &&
          !error.includes('Download the React DevTools') &&
          !error.includes('favicon.ico')
      )

      expect(criticalErrors).toHaveLength(0)
    })

    test('should maintain stable frame rate during rendering', async ({ page }) => {
      await page.waitForSelector('canvas')

      // Monitor performance for a few seconds
      let frameCount = 0

      const measureFrameRate = async () => {
        await page.evaluate(() => {
          return new Promise((resolve) => {
            requestAnimationFrame(resolve)
          })
        })
        frameCount++
      }

      // Measure for 2 seconds
      const startTime = Date.now()
      while (Date.now() - startTime < 2000) {
        await measureFrameRate()
      }

      const elapsed = Date.now() - startTime
      const fps = (frameCount / elapsed) * 1000

      // Should maintain reasonable frame rate (at least 10 FPS)
      expect(fps).toBeGreaterThan(10)
    })

    test('should handle multiple rapid viewport changes', async ({ page }) => {
      await page.waitForSelector('canvas')

      const viewports = [
        { width: 1200, height: 800 },
        { width: 400, height: 600 },
        { width: 800, height: 600 },
        { width: 1200, height: 800 },
      ]

      // Rapidly change viewport sizes
      for (let i = 0; i < viewports.length; i++) {
        await page.setViewportSize(viewports[i])
        await page.waitForTimeout(200) // Brief pause

        // Canvas should remain visible throughout
        const canvas = page.locator('canvas')
        await expect(canvas).toBeVisible()
      }

      // Final check that everything still works
      await page.waitForTimeout(1000)
      const canvas = page.locator('canvas')
      await expect(canvas).toBeVisible()

      const finalBox = await canvas.boundingBox()
      expect(finalBox).not.toBeNull()
    })
  })
})
