import { test, expect } from '@playwright/test'

test.describe('Fish Inspect E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Start in dev mode so we have credits and a STANDARD tank
    await page.goto('/?dev=true')
  })

  test('clicking a fish opens the info panel', async ({ page }) => {
    // Buy a Guppy to ensure a fish exists
    const buyButton = page.getByRole('button', { name: /Buy GUPPY/i })
    await expect(buyButton).toBeVisible()
    await buyButton.click()

    // Wait for canvas to be ready
    const aquarium = page.getByTestId('aquarium-container')
    await expect(aquarium).toBeVisible()
    const canvas = aquarium.locator('canvas').first()
    await expect(canvas).toBeVisible()

    // Try clicking a few sample points on the canvas until the panel appears
    const box = await canvas.boundingBox()
    if (!box) throw new Error('Canvas bounding box not available')

    const samplePoints = [
      { x: box.x + box.width / 2, y: box.y + box.height / 2 },
      { x: box.x + box.width * 0.25, y: box.y + box.height * 0.5 },
      { x: box.x + box.width * 0.75, y: box.y + box.height * 0.5 },
      { x: box.x + box.width * 0.5, y: box.y + box.height * 0.25 },
      { x: box.x + box.width * 0.5, y: box.y + box.height * 0.75 },
    ]

    let panelVisible = false
    for (const p of samplePoints) {
      // Click the canvas at the chosen coordinate
      await page.mouse.click(p.x, p.y)

      // Short wait for UI reaction
      try {
        await expect(page.getByRole('dialog', { name: 'Fish info panel' })).toBeVisible({ timeout: 500 })
        panelVisible = true
        break
      } catch (err) {
        // continue to next sample point
      }
    }

    // If the panel wasn't found by clicking, fail with helpful diagnostic
    expect(panelVisible, 'Fish info panel did not appear after clicking canvas sample points').toBe(true)

    // Verify content inside the panel
    const panel = page.getByRole('dialog', { name: 'Fish info panel' })
    await expect(panel.getByText(/Estimated value/i)).toBeVisible()
    await expect(panel.getByText(/Age:/i)).toBeVisible()
  })
})
