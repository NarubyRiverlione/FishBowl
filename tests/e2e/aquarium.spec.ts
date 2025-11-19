import { test, expect } from '@playwright/test'

test('aquarium renders correctly', async ({ page }) => {
  // Monitor console logs and errors
  page.on('console', (msg) => console.log(`[Browser ${msg.type()}]: ${msg.text()}`))
  page.on('pageerror', (err) => console.error(`[Browser Error]: ${err.message}`))

  await page.goto('/')

  // Wait for the root element to be populated (React hydration)
  await page.waitForSelector('#root > div')

  // Check if the main heading is visible
  await expect(page.getByRole('heading', { name: 'FishBowl Visual Prototype' })).toBeVisible()

  // Check if the aquarium container is present
  const aquarium = page.getByTestId('aquarium-container')
  await expect(aquarium).toBeVisible()

  // Check dimensions
  await expect(aquarium).toHaveCSS('width', '800px')
  await expect(aquarium).toHaveCSS('height', '600px')

  // Check if the canvas (PixiJS) is created inside the container
  // Use first() to handle potential duplicates gracefully
  const canvas = aquarium.locator('canvas').first()
  await expect(canvas).toBeVisible()
})
