import { test, expect } from '@playwright/test'

test.describe('Core Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    // Start with dev mode to have credits and standard tank
    await page.goto('/?dev=true')
  })

  test('should allow buying a fish', async ({ page }) => {
    // Check initial credits (100 in dev mode)
    await expect(page.getByText('Credits: 100')).toBeVisible()

    // Buy Guppy (50)
    await page.getByRole('button', { name: /Buy GUPPY/ }).click()

    // Check credits decreased
    await expect(page.getByText('Credits: 50')).toBeVisible()

    // Check fish count in HUD
    await expect(page.getByText('Cap: 1/')).toBeVisible()
  })

  test('should allow feeding', async ({ page }) => {
    // Buy fish first so feeding has cost
    await page.getByRole('button', { name: /Buy GUPPY/ }).click()

    // Feed
    await page.getByRole('button', { name: 'Feed' }).click()

    // Cost: Base 2 + 1 per fish = 3.
    // Initial 100 - 50 (fish) - 3 (feed) = 47.
    await expect(page.getByText('Credits: 47')).toBeVisible()
  })

  test('should allow cleaning', async ({ page }) => {
    // Clean cost 10
    await page.getByRole('button', { name: /Clean/ }).click()

    // 100 - 10 = 90
    await expect(page.getByText('Credits: 90')).toBeVisible()
  })
})
