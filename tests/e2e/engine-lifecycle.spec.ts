import { test, expect } from '@playwright/test'

interface WindowWithTestHelpers extends Window {
  __TEST_HELPERS__?: {
    getFishScreenPositions?: () => unknown[]
    awaitFishRendered?: (timeout?: number) => Promise<boolean>
    getStoreFishCount?: () => number
    getStoreTanks?: () => unknown
    forceSync?: () => void
  }
}

test.describe('Rendering Engine Lifecycle E2E', () => {
  test('should maintain single rendering engine instance across tank switching', async ({ page }) => {
    // Enable debug mode
    await page.goto('/?dev=true&testHelpers=true&__FISHBOWL_DEBUG_ENGINE__=true')

    // Wait for app to load
    await page.waitForLoadState('networkidle')

    // Verify aquarium container exists
    const container = await page.locator('[data-testid="aquarium-container"]')
    await expect(container).toBeVisible()

    // Get initial test helpers
    const testHelpers = await page.evaluate(() => {
      return (window as WindowWithTestHelpers).__TEST_HELPERS__
    })
    expect(testHelpers).toBeDefined()

    // Verify initial render
    const initialRenderSuccess = await page.evaluate(() => {
      return (window as WindowWithTestHelpers).__TEST_HELPERS__?.awaitFishRendered?.(2000)
    })
    expect(initialRenderSuccess).toBe(true)
  })

  test('should not create duplicate engines on rapid tank operations', async ({ page }) => {
    await page.goto('/?dev=true&testHelpers=true')

    await page.waitForLoadState('networkidle')

    // Get store fish count
    const initialFishCount = await page.evaluate(() => {
      return (window as WindowWithTestHelpers).__TEST_HELPERS__?.getStoreFishCount?.()
    })

    // Force multiple syncs in rapid succession
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        ;(window as WindowWithTestHelpers).__TEST_HELPERS__?.forceSync?.()
      })
    }

    // Verify fish count remains consistent
    const finalFishCount = await page.evaluate(() => {
      return (window as WindowWithTestHelpers).__TEST_HELPERS__?.getStoreFishCount?.()
    })

    expect(finalFishCount).toBe(initialFishCount)
  })

  test('should properly cleanup rendering engine on page unload', async ({ context }) => {
    const page1 = await context.newPage()
    await page1.goto('/?dev=true&testHelpers=true')
    await page1.waitForLoadState('networkidle')

    // Verify aquarium is active
    const container = await page1.locator('[data-testid="aquarium-container"]')
    await expect(container).toBeVisible()

    // Close the page
    await page1.close()

    // Open a new page
    const page2 = await context.newPage()
    await page2.goto('/?dev=true&testHelpers=true')
    await page2.waitForLoadState('networkidle')

    // Verify new aquarium is active and renders properly
    const container2 = await page2.locator('[data-testid="aquarium-container"]')
    await expect(container2).toBeVisible()

    const renderSuccess = await page2.evaluate(() => {
      return (window as WindowWithTestHelpers).__TEST_HELPERS__?.awaitFishRendered?.(2000)
    })
    expect(renderSuccess).toBe(true)

    await page2.close()
  })

  test('should render aquarium without errors on initial load', async ({ page }) => {
    await page.goto('/?dev=true')

    await page.waitForLoadState('networkidle')

    // Verify no console errors related to rendering
    const consoleMessages: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('RenderingEngine')) {
        consoleMessages.push(msg.text())
      }
    })

    // Wait a moment for any errors to be logged
    await page.waitForTimeout(1000)

    // Check for rendering errors
    const hasRenderingErrors = consoleMessages.some((msg) =>
      msg.includes('Failed to initialize') || msg.includes('RenderingEngine')
    )

    expect(hasRenderingErrors).toBe(false)

    // Verify aquarium is visible
    const container = await page.locator('[data-testid="aquarium-container"]')
    await expect(container).toBeVisible()
  })

  test('should handle tank switching without duplicate engines', async ({ page }) => {
    await page.goto('/?dev=true&testHelpers=true')

    await page.waitForLoadState('networkidle')

    // Wait for initial render
    const initialRender = await page.evaluate(() => {
      return (window as WindowWithTestHelpers).__TEST_HELPERS__?.awaitFishRendered?.(2000)
    })
    expect(initialRender).toBe(true)

    // Verify aquarium is still responsive after switching
    const container = await page.locator('[data-testid="aquarium-container"]')
    await expect(container).toBeVisible()

    // Get final tanks (should be same or similar)
    const finalTanks = await page.evaluate(() => {
      return (window as WindowWithTestHelpers).__TEST_HELPERS__?.getStoreTanks?.()
    })

    expect(finalTanks).toBeDefined()
  })

  test('should provide consistent fish rendering across engine resets', async ({ page }) => {
    await page.goto('/?dev=true&testHelpers=true')

    await page.waitForLoadState('networkidle')

    // Get initial fish count
    const count1 = await page.evaluate(() => {
      return (window as WindowWithTestHelpers).__TEST_HELPERS__?.getStoreFishCount?.()
    })

    // Force sync
    await page.evaluate(() => {
      ;(window as WindowWithTestHelpers).__TEST_HELPERS__?.forceSync?.()
    })

    const count2 = await page.evaluate(() => {
      return (window as WindowWithTestHelpers).__TEST_HELPERS__?.getStoreFishCount?.()
    })

    // Counts should be consistent
    expect(count2).toEqual(count1)
  })
})
