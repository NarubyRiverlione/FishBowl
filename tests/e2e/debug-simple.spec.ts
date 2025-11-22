import { test, expect } from '@playwright/test'

test.describe('Debug Overlay - Simple Test', () => {
  test('should show debug overlay in developer mode', async ({ page }) => {
    // Go to app with developer mode enabled
    await page.goto('http://localhost:5174/?dev=true')

    // Wait for app to load
    await page.waitForLoadState('networkidle')

    // Check that debug overlay exists and is visible
    const debugOverlay = page.locator('.debug-overlay')
    await expect(debugOverlay).toBeVisible({ timeout: 10000 })

    // Check for debug content
    await expect(page.locator('text=Tank Count:')).toBeVisible()
    await expect(page.locator('text=Fish Count:')).toBeVisible()
    await expect(page.locator('text=Water Quality:')).toBeVisible()
  })

  test('should NOT show debug overlay in normal mode', async ({ page }) => {
    // Go to app without developer mode
    await page.goto('http://localhost:5174/')

    // Wait for app to load
    await page.waitForLoadState('networkidle')

    // Debug overlay should not exist
    const debugOverlay = page.locator('.debug-overlay')
    await expect(debugOverlay).not.toBeVisible()
  })
})
