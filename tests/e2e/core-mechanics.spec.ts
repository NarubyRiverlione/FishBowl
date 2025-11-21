import { test, expect } from '@playwright/test'

test.describe('Core Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    // Start with dev mode to have credits and standard tank
    await page.goto('/?dev=true&testHelpers=true')
  })

  test('should allow buying a fish', async ({ page }) => {
    // Check initial credits (100 in dev mode)
    await expect(page.getByText(/^100$/)).toBeVisible()

    // Open buy menu and buy Guppy (50)
    await page.getByRole('button', { name: /Buy/ }).click()
    await page.getByRole('button', { name: /GUPPY/ }).click()

    // Check credits decreased to 50
    await expect(page.getByText(/^50$/)).toBeVisible()

    // Check fish count in HUD shows 1 in the tank (e.g. '1/')
    await expect(page.getByText(/1\//)).toBeVisible()
  })

  test('should allow feeding', async ({ page }) => {
    // Buy fish first so feeding has cost
    await page.getByRole('button', { name: /Buy/ }).click()
    await page.getByRole('button', { name: /GUPPY/ }).click()

    // Feed
    await page.getByRole('button', { name: 'Feed' }).click()

    // Cost: Base 2 + 1 per fish = 3. Expect credits to be 47
    await expect(page.getByText(/^47$/)).toBeVisible()
  })

  test('should allow cleaning', async ({ page }) => {
    // Clean cost 10
    await page.getByRole('button', { name: /Clean/ }).click()
    // 100 - 10 = 90
    await expect(page.getByText(/^90$/)).toBeVisible()
  })
})
