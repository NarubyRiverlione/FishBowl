# Example: How Test Constants Prevent Breakage

## Before: Magic Numbers (Fragile)

```typescript
// ❌ BAD - E2E test with magic numbers
test('should allow buying a fish', async ({ page }) => {
  await expect(page.getByText(/^1000$/)).toBeVisible() // What is 1000?

  await page.getByRole('button', { name: /GUPPY/ }).click()
  await expect(page.getByText(/^950$/)).toBeVisible() // How is 950 calculated?
})

// ❌ BAD - Unit test with magic numbers
test('canBuyFish works correctly', () => {
  expect(EconomyService.canBuyFish(100, tank, FishSpecies.GUPPY)).toBe(true) // Why 100?
})
```

**Problem**: If you change `GUPPY.baseValue` from 50 to 60, tests break everywhere!

## After: Strategic Constants (Robust)

```typescript
// ✅ GOOD - E2E test with scenario constants
test('should allow buying a fish', async ({ page }) => {
  const { INITIAL_CREDITS } = TEST_SCENARIOS.DEV_MODE
  await expect(page.getByText(USER_CONTRACTS.UI_PATTERNS.CREDITS(INITIAL_CREDITS))).toBeVisible()

  await page.getByRole('button', { name: /GUPPY/ }).click()
  const expectedCredits = TEST_HELPERS.expectCreditsAfterDevModeActions.afterBuyingGuppy()
  await expect(page.getByText(USER_CONTRACTS.UI_PATTERNS.CREDITS(expectedCredits))).toBeVisible()
})

// ✅ GOOD - Unit test with business logic constants
test('canBuyFish works correctly', () => {
  const sufficientCredits = BUSINESS_LOGIC.COSTS.GUPPY * 2
  expect(EconomyService.canBuyFish(sufficientCredits, tank, FishSpecies.GUPPY)).toBe(true)
})
```

**Benefits**:

- ✅ Change `GUPPY.baseValue` → tests automatically adapt
- ✅ Clear intent: what values mean and why
- ✅ Centralized test configuration
- ✅ User-facing values protected as contracts

## Scenario: Gameplay Balancing

### Developer Changes Game Balance

```typescript
// Developer improves game balance
export const FISH_SPECIES_CONFIG = {
  GUPPY: { baseValue: 75, ... },  // Was 50, now 75 for better progression
}
```

### Test Results

```bash
# ✅ Unit tests pass automatically - use business logic constants
✓ canBuyFish respects credits and tank capacity

# ✅ E2E tests pass automatically - use calculated values
✓ should allow buying a fish (expects 1000 → 925, calculated from constants)

# 🚨 Contract test alerts about user-facing change
✗ Fish prices remain stable for existing players
  Expected: 50, Received: 75
```

### Developer Action Required

```typescript
// Developer must explicitly acknowledge user-facing changes
export const USER_CONTRACTS = {
  UI_VALUES: {
    GUPPY_COST: 75, // Updated with migration plan
  },
}
```

## Key Principles

1. **Unit/Integration Tests**: Use imported constants → Tests adapt to changes
2. **E2E Tests**: Use calculated values → Tests verify user experience accurately
3. **Contract Tests**: Use fixed values → Tests protect against unintended breaking changes
4. **Test Scenarios**: Centralized configuration → Easy to modify test data

## Result

- 🎯 **Tests catch real bugs** instead of breaking on parameter changes
- 🔄 **Business logic changes** are automatically reflected in tests
- 🛡️ **User-facing contracts** are explicitly protected
- 📖 **Test intent** is clear and maintainable
