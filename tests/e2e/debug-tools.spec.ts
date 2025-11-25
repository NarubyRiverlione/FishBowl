/**
 * E2E tests for debug infrastructure and tank state validation (T040e)
 * Tests debug overlay functionality and tank debugger tools in dev mode
 */

import { test, expect } from '@playwright/test'

test.describe('Debug Tools E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app with developer mode enabled
    await page.goto('/?dev=true')

    // Wait for the app to load
    await page.waitForSelector('canvas')
    await expect(page.locator('canvas')).toBeVisible()
  })

  test('should show debug overlay in developer mode', async ({ page }) => {
    // Debug overlay should be visible when dev mode is enabled
    await expect(page.locator('text=🛠️ Debug Info')).toBeVisible()

    // Check that key debug sections are present
    await expect(page.locator('text=🏠 Tank State')).toBeVisible()
    await expect(page.locator('text=🎯 Collision System')).toBeVisible()
    await expect(page.locator('text=🎮 Rendering Engine')).toBeVisible()
  })

  test('should not show debug overlay in normal mode', async ({ page }) => {
    // Navigate without dev mode
    await page.goto('/')
    await page.waitForSelector('canvas')

    // Debug overlay should not be visible
    await expect(page.locator('text=🛠️ Debug Info')).not.toBeVisible()
  })

  test('should display tank statistics correctly', async ({ page }) => {
    // Wait for debug overlay to load
    await expect(page.locator('text=🛠️ Debug Info')).toBeVisible()

    // Check that tank statistics are displayed
    await expect(page.locator('text=Tanks:')).toBeVisible()
    await expect(page.locator('text=Fish Total:')).toBeVisible()
    await expect(page.locator('text=Fish Alive:')).toBeVisible()
    await expect(page.locator('text=Water Quality:')).toBeVisible()
    await expect(page.locator('text=Pollution:')).toBeVisible()

    // In dev mode, we should start with pre-populated fish
    const fishTotalElement = page.locator('text=Fish Total:').locator('..').locator('span').nth(1)
    const fishTotal = await fishTotalElement.textContent()
    expect(parseInt(fishTotal || '0')).toBeGreaterThan(0)
  })

  test('should display collision system statistics', async ({ page }) => {
    // Wait for debug overlay to load
    await expect(page.locator('text=🛠️ Debug Info')).toBeVisible()

    // Check collision system stats
    await expect(page.locator('text=Collision Checks:')).toBeVisible()
    await expect(page.locator('text=Checks/Second:')).toBeVisible()
  })

  test('should display rendering engine statistics', async ({ page }) => {
    // Wait for canvas to be fully rendered
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()

    // Wait for debug overlay to load
    await expect(page.locator('text=🛠️ Debug Info')).toBeVisible()

    // Check rendering engine stats
    await expect(page.locator('text=Engine Instances:')).toBeVisible()
    await expect(page.locator('text=Canvas Present:')).toBeVisible()

    // Should show that canvas is present
    const canvasStatusElement = page.locator('text=Canvas Present:').locator('..').locator('span').nth(1)
    const canvasStatus = await canvasStatusElement.textContent()
    expect(canvasStatus).toBe('Yes')
  })

  test('should update statistics in real-time', async ({ page }) => {
    // Wait for debug overlay to load
    await expect(page.locator('text=🛠️ Debug Info')).toBeVisible()

    // Get initial timestamp
    const timestampElement = page.locator('.debug-overlay').locator('span').first()
    const initialTimestamp = await timestampElement.textContent()

    // Wait for stats to update (they update every second)
    await page.waitForTimeout(1100)

    // Check that timestamp has updated
    const updatedTimestamp = await timestampElement.textContent()
    expect(updatedTimestamp).not.toBe(initialTimestamp)
  })

  test('should allow resetting statistics', async ({ page }) => {
    // Wait for debug overlay to load
    await expect(page.locator('text=🛠️ Debug Info')).toBeVisible()

    // Click the reset stats button
    await page.locator('button', { hasText: 'Reset Stats' }).click()

    // Should not throw any errors (basic functionality test)
    // The actual reset functionality is tested in unit tests
    await page.waitForTimeout(100)
  })

  test('should allow tank validation', async ({ page }) => {
    // Wait for debug overlay to load
    await expect(page.locator('text=🛠️ Debug Info')).toBeVisible()

    // Set up dialog handler for the validation result
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('alert')
      // Should show either no issues or specific issues
      expect(dialog.message()).toMatch(/No issues found!|Issues:/)
      await dialog.accept()
    })

    // Click the validate tank button
    await page.locator('button', { hasText: 'Validate Tank' }).click()
  })

  test('should handle tank state changes dynamically', async ({ page }) => {
    // Wait for debug overlay to load
    await expect(page.locator('text=🛠️ Debug Info')).toBeVisible()

    // Get initial fish count
    const fishTotalElement = page.locator('text=Fish Total:').locator('..').locator('span').nth(1)
    const initialFishCount = await fishTotalElement.textContent()

    // Open buy menu and buy a fish
    await page.getByRole('button', { name: /Buy/ }).click()

    // Buy a guppy (if available)
    const guppyButton = page.getByRole('button', { name: /GUPPY/ })
    if (await guppyButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await guppyButton.click()

      // Wait for stats to update
      await page.waitForTimeout(1100)

      // Fish count should have increased
      const newFishCount = await fishTotalElement.textContent()
      expect(parseInt(newFishCount || '0')).toBeGreaterThan(parseInt(initialFishCount || '0'))
    }
  })

  test('should show proper engine instance count', async ({ page }) => {
    // Wait for debug overlay to load
    await expect(page.locator('text=🛠️ Debug Info')).toBeVisible()

    // Engine instances should be 1 (single instance pattern)
    const engineInstancesElement = page.locator('text=Engine Instances:').locator('..').locator('span').nth(1)
    const engineInstances = await engineInstancesElement.textContent()
    expect(engineInstances).toBe('1')
  })

  test('should validate debug overlay styling and positioning', async ({ page }) => {
    // Wait for debug overlay to load
    await expect(page.locator('text=🛠️ Debug Info')).toBeVisible()

    const debugOverlay = page.locator('.debug-overlay').first()

    // Check positioning (should be fixed to top-right)
    const boundingBox = await debugOverlay.boundingBox()
    expect(boundingBox).not.toBeNull()

    // Should be in the top-right area of the viewport
    const viewportSize = page.viewportSize()
    if (boundingBox && viewportSize) {
      expect(boundingBox.x).toBeGreaterThan(viewportSize.width / 2)
      expect(boundingBox.y).toBeLessThan(100) // Near top
    }
  })

  test('should handle browser refresh while maintaining debug state', async ({ page }) => {
    // Navigate with dev mode
    await page.goto('/?dev=true')
    await expect(page.locator('text=🛠️ Debug Info')).toBeVisible()

    // Refresh the page
    await page.reload()

    // Debug overlay should still be visible after refresh
    await expect(page.locator('text=🛠️ Debug Info')).toBeVisible()
    await expect(page.locator('text=🏠 Tank State')).toBeVisible()
  })
})
