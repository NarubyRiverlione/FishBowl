import { test, expect } from '@playwright/test'

test.describe('Fish Inspect E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Start in dev mode so we have credits and a STANDARD tank, enable test helpers via URL
    await page.goto('/?dev=true&testHelpers=true')
  })

  test('clicking a fish opens the info panel', async ({ page }) => {
    // Buy a Guppy to ensure a fish exists
    await page.getByRole('button', { name: /Buy/ }).click()
    await page.getByRole('button', { name: /GUPPY/i }).click()

    // Wait for canvas to be ready
    const aquarium = page.getByTestId('aquarium-container')
    await expect(aquarium).toBeVisible()
    const canvas = aquarium.locator('canvas').first()
    await expect(canvas).toBeVisible()

    // Prefer deterministic helper flow (enabled via URL flag)
    // Wait for HUD to show the fish was added (12 dev fish + 1 bought = 13)
    await page.getByText(/STANDARD 13\/15/).waitFor({ timeout: 3000 })

    // If the helper is available, wait for the store to show the fish, then wait for renderer
    let helperPositions: Array<{ id: string; x: number; y: number }> | null = null
    const helperAvailable = await page.evaluate(() => {
      return Boolean(
        (
          window as Window & {
            __TEST_HELPERS__?: {
              getStoreFishCount?: () => number
              forceSync?: () => void
              awaitFishRendered?: (timeout: number) => Promise<boolean>
              getFishScreenPositions?: () => Array<{ id: string; x: number; y: number }>
              _lastSyncFishCount?: number
              _lastAddedFishId?: string
              _addedSpritesCount?: number
              _lastSyncTimestamp?: number
            }
          }
        ).__TEST_HELPERS__
      )
    })

    if (helperAvailable) {
      // 1) Wait for store to reflect the bought fish (poll up to 3s)
      const startStore = Date.now()
      let storeCount = 0
      while (Date.now() - startStore < 3000) {
        storeCount = await page.evaluate(
          () =>
            (
              window as Window & {
                __TEST_HELPERS__?: { getStoreFishCount?: () => number }
              }
            ).__TEST_HELPERS__?.getStoreFishCount?.() ?? 0
        )
        if (storeCount && storeCount > 0) break

        await page.waitForTimeout(150)
      }

      console.log('DEBUG storeFishCount (post-buy):', storeCount)

      // 2) Force sync (test-only) to ensure the engine processes the updated store

      await page.evaluate(() =>
        (
          window as Window & {
            __TEST_HELPERS__?: { forceSync?: () => void }
          }
        ).__TEST_HELPERS__?.forceSync?.()
      )
      // 3) Wait for renderer to report sprites (uses RenderingEngine.waitForFishRendered)

      const rendered = await page.evaluate(
        (t: number) =>
          (
            window as Window & {
              __TEST_HELPERS__?: { awaitFishRendered?: (timeout: number) => Promise<boolean> }
            }
          ).__TEST_HELPERS__?.awaitFishRendered?.(t),
        5000
      )

      console.log('DEBUG awaitFishRendered returned', rendered)

      // 3) Fetch positions
      helperPositions = (await page.evaluate(() => {
        return (
          (
            window as Window & {
              __TEST_HELPERS__?: { getFishScreenPositions?: () => Array<{ id: string; x: number; y: number }> }
            }
          ).__TEST_HELPERS__?.getFishScreenPositions?.() || null
        )
      })) as { id: string; x: number; y: number }[] | null
    } else {
      // Fallback: poll for positions directly (up to 3s)
      const start = Date.now()
      while (Date.now() - start < 3000) {
        helperPositions = (await page.evaluate(() => {
          return (
            (
              window as Window & {
                __TEST_HELPERS__?: { getFishScreenPositions?: () => Array<{ id: string; x: number; y: number }> }
              }
            ).__TEST_HELPERS__?.getFishScreenPositions?.() || null
          )
        })) as { id: string; x: number; y: number }[] | null
        if (helperPositions && helperPositions.length > 0) break

        await page.waitForTimeout(200)
      }
    }

    // Debug: capture helper positions and canvas box in test logs
    const debugHelper = await page.evaluate(() => {
      const h =
        (
          window as Window & {
            __TEST_HELPERS__?: {
              getFishScreenPositions?: () => Array<{ id: string; x: number; y: number }>
              _lastSyncFishCount?: number
              _lastAddedFishId?: string
              _addedSpritesCount?: number
              _lastSyncTimestamp?: number
            }
          }
        ).__TEST_HELPERS__ || {}
      // Return diagnostic snapshot
      return {
        positions: h.getFishScreenPositions?.() || null,
        lastSync: h._lastSyncFishCount ?? null,
        lastAddedId: h._lastAddedFishId ?? null,
        addedSpritesCount: h._addedSpritesCount ?? null,
        ts: h._lastSyncTimestamp ?? null,
      }
    })

    console.log('DEBUG helperPositions:', debugHelper)

    const box = await canvas.boundingBox()
    if (!box) throw new Error('Canvas bounding box not available')

    let panelVisible = false
    if (helperPositions && helperPositions.length > 0) {
      // Click the first fish position using canvas bounding box offset
      const pos = helperPositions[0]!
      await page.mouse.click(box.x + pos.x, box.y + pos.y)
      try {
        await expect(page.getByRole('dialog', { name: 'Fish info panel' })).toBeVisible({ timeout: 1000 })
        panelVisible = true
      } catch {
        // fall back to sampling below
        panelVisible = false
      }
    }

    // Fallback: sample several canvas points (less deterministic)
    if (!panelVisible) {
      const samplePoints = [
        { x: box.x + box.width / 2, y: box.y + box.height / 2 },
        { x: box.x + box.width * 0.25, y: box.y + box.height * 0.5 },
        { x: box.x + box.width * 0.75, y: box.y + box.height * 0.5 },
        { x: box.x + box.width * 0.5, y: box.y + box.height * 0.25 },
        { x: box.x + box.width * 0.5, y: box.y + box.height * 0.75 },
      ]

      for (const p of samplePoints) {
        await page.mouse.click(p.x, p.y)
        try {
          await expect(page.getByRole('dialog', { name: 'Fish info panel' })).toBeVisible({ timeout: 500 })
          panelVisible = true
          break
        } catch {
          // continue
        }
      }
    }

    // If the panel wasn't found by clicking, fail with helpful diagnostic
    expect(panelVisible, 'Fish info panel did not appear after clicking canvas sample points').toBe(true)

    // Verify content inside the panel
    const panel = page.getByRole('dialog', { name: 'Fish info panel' })
    await expect(panel.getByText(/Estimated value/i)).toBeVisible()
    // Use Life stage as a robust check for the panel contents (Age can match multiple nodes in strict mode)
    await expect(panel.getByText(/Life stage:/i)).toBeVisible()
  })
})
