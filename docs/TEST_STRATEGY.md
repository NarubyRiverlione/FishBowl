# Test Strategy: Constants vs Magic Numbers

## Guidelines for FishBowl Test Design

### 🎯 **Use Constants In:**

#### Unit Tests

```typescript
// ✅ GOOD - Test logic, not values
import { FEED_BASE_COST, FEED_PER_FISH_COST } from '../../../src/lib/constants'

expect(EconomyService.getFeedCost(3)).toBe(FEED_BASE_COST + FEED_PER_FISH_COST * 3)
```

#### Integration Tests

```typescript
// ✅ GOOD - Test relationships
import { GUPPY_BASE_VALUE, TANK_CAPACITY_STANDARD } from '../../../src/lib/constants'

const initialCredits = 1000
buyFish(FishSpecies.GUPPY)
expect(store.credits).toBe(initialCredits - GUPPY_BASE_VALUE)
```

#### Business Logic Tests

```typescript
// ✅ GOOD - Test formulas work correctly
import { POLLUTION_PER_FISH_PER_TICK } from '../../../src/lib/constants'

const fishCount = 5
tick()
expect(newPollution).toBe(oldPollution + fishCount * POLLUTION_PER_FISH_PER_TICK)
```

### 🚫 **Use Magic Numbers In:**

#### E2E Tests (User Experience)

```typescript
// ✅ GOOD - User sees specific values in UI
await expect(page.getByText(/^1000$/)).toBeVisible() // Dev mode credits
await expect(page.getByText(/^950$/)).toBeVisible() // After buying 50-credit fish
```

#### Regression Protection

```typescript
// ✅ GOOD - Prevent accidental changes
test('Fish prices remain stable for existing players', () => {
  expect(FISH_SPECIES_CONFIG.GUPPY.baseValue).toBe(50) // Locked for compatibility
})
```

#### API Contract Tests

```typescript
// ✅ GOOD - External contracts
expect(gameState.credits).toBeGreaterThanOrEqual(0) // Business rule
expect(saveGameData.version).toBe('1.0') // Save format
```

### 🔄 **Test Configuration Approach**

#### Create Test Constants File

```typescript
// tests/config/testConstants.ts
export const TEST_SCENARIOS = {
  DEV_MODE: {
    INITIAL_CREDITS: 1000,
    TANK_CAPACITY: 15,
    INITIAL_FISH_COUNT: 12,
  },
  NORMAL_MODE: {
    INITIAL_CREDITS: 50,
    TANK_CAPACITY: 1,
  },
} as const
```

#### Use in E2E Tests

```typescript
import { TEST_SCENARIOS } from '../config/testConstants'

// ✅ GOOD - Centralized but still explicit
const { INITIAL_CREDITS, INITIAL_FISH_COUNT } = TEST_SCENARIOS.DEV_MODE
await expect(page.getByText(new RegExp(`^${INITIAL_CREDITS}$`))).toBeVisible()
```

## 📋 **Action Plan**

### Phase 1: Immediate (High Value, Low Risk)

1. **Unit Tests**: Replace magic numbers with imported constants for calculations
2. **Integration Tests**: Use constants for business logic relationships
3. **Create test constants file** for E2E scenarios

### Phase 2: Strategic (Medium Risk)

1. **E2E Test Configuration**: Create scenario-based test data
2. **Add regression protection tests** for critical constants
3. **Document which values are "contracts"** vs "tuneable parameters"

### Phase 3: Advanced (Optional)

1. **Property-based testing** for value ranges
2. **Contract testing** for save/load compatibility
3. **Performance testing** with different parameter sets
