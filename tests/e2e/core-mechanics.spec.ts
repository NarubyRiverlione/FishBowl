import { test, expect } from '@playwright/test'
import { TEST_SCENARIOS, USER_CONTRACTS, TEST_HELPERS } from '../config/testConstants'

test.describe('Core Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    // Start with dev mode to have credits and standard tank
    await page.goto(TEST_SCENARIOS.DEV_MODE.URL_PARAMS)
  })

  test('should allow buying a fish', async ({ page }) => {
    // Check initial credits (dev mode)
    const initialCredits = TEST_SCENARIOS.DEV_MODE.INITIAL_CREDITS
    await expect(page.getByText(USER_CONTRACTS.UI_PATTERNS.CREDITS(initialCredits))).toBeVisible()

    // Open buy menu and buy Guppy
    await page.getByRole('button', { name: /Buy/ }).click()
    await page.getByRole('button', { name: /GUPPY/ }).click()

    // Check credits decreased by GUPPY cost
    const expectedCredits = TEST_HELPERS.expectCreditsAfterDevModeActions.afterBuyingGuppy()
    await expect(page.getByText(USER_CONTRACTS.UI_PATTERNS.CREDITS(expectedCredits))).toBeVisible()

    // Check fish count shows correct total (dev fish + purchased)
    const expectedFishCount = TEST_SCENARIOS.DEV_MODE.INITIAL_FISH_COUNT + 1
    const expectedCapacity = TEST_SCENARIOS.DEV_MODE.TANK_CAPACITY
    await expect(
      page.getByText(USER_CONTRACTS.UI_PATTERNS.TANK_STATUS(expectedFishCount, expectedCapacity))
    ).toBeVisible()
  })

  test('should allow feeding', async ({ page }) => {
    // Buy fish first so feeding has cost
    await page.getByRole('button', { name: /Buy/ }).click()
    await page.getByRole('button', { name: /GUPPY/ }).click()

    // Feed
    await page.getByRole('button', { name: 'Feed' }).click()

    // Check credits after buying and feeding
    const expectedCredits = TEST_HELPERS.expectCreditsAfterDevModeActions.afterBuyingAndFeeding()
    await expect(page.getByText(USER_CONTRACTS.UI_PATTERNS.CREDITS(expectedCredits))).toBeVisible()
  })

  test('should allow cleaning', async ({ page }) => {
    // Clean tank
    await page.getByRole('button', { name: /Clean/ }).click()

    // Check credits after cleaning
    const expectedCredits = TEST_HELPERS.expectCreditsAfterDevModeActions.afterCleaning()
    await expect(page.getByText(USER_CONTRACTS.UI_PATTERNS.CREDITS(expectedCredits))).toBeVisible()
  })
})
