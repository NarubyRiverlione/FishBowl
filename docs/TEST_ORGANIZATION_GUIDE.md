# Test Organization Guidelines

## Clear Patterns for Unit vs Integration Tests

### 🎯 **UNIT TESTS** (`tests/unit/`)

**Purpose**: Test individual components/functions in isolation with minimal dependencies

**Characteristics**:

- ✅ Test single classes, functions, or pure logic
- ✅ Mock external dependencies
- ✅ Fast execution (< 10ms per test typically)
- ✅ Focused on specific behavior/edge cases
- ✅ No real external systems (no real DOM, no real stores)

**Examples of PROPER Unit Tests**:

- `Fish.test.ts` - Fish model logic only
- `Tank.test.ts` - Tank model methods
- `EconomyService.test.ts` - Pure calculation functions
- `physics.test.ts` - Math/physics calculations
- `collision.test.ts` - Collision detection algorithms
- `random.test.ts` - Random utility functions

### 🔗 **INTEGRATION TESTS** (`tests/integration/`)

**Purpose**: Test how multiple components work together in realistic scenarios

**Characteristics**:

- ✅ Test multiple components working together
- ✅ Use real stores/state management
- ✅ Test complete user workflows
- ✅ May use real DOM/React rendering
- ✅ Slower execution but comprehensive
- ✅ Test data flow between layers

**Examples of PROPER Integration Tests**:

- `BuyAndTick.test.ts` - Store + Game Loop + Economy
- `AquariumCanvas.test.tsx` - React + PIXI + Store
- `FeedAndSurvive.test.ts` - Feeding + Fish Survival + Time
- `Progression.test.ts` - Complete game progression flow

---

## 🚨 **CURRENT MISCLASSIFICATIONS IDENTIFIED**

### Unit Tests that should be Integration Tests:

**1. `Feeding.test.ts` → MOVE to Integration**

- **Why**: Uses real `useGameStore`, tests store state changes
- **Current**: Tests store-level feeding mechanics
- **Should be**: Tests feeding logic in isolation OR move to integration

**2. `Cleaning.test.ts` → MOVE to Integration**

- **Why**: Uses real `useGameStore`, tests store state changes
- **Current**: Tests tank cleaning with full store
- **Should be**: Integration test of cleaning workflow

**3. `Pollution.test.ts` → MOVE to Integration**

- **Why**: Uses real `useGameStore`, tests water quality system
- **Current**: Tests pollution mechanics with store
- **Should be**: Integration test of pollution system

**4. `SellFish.test.ts` → MOVE to Integration**

- **Why**: Uses real `useGameStore`, tests economic transactions
- **Current**: Tests selling mechanics with store
- **Should be**: Integration test of selling workflow

**5. `DeveloperMode.test.ts` → MOVE to Integration**

- **Why**: Tests query parameter initialization with store
- **Current**: Tests developer mode setup
- **Should be**: Integration test of app initialization

### Integration Tests that could be Unit Tests:

**6. `performance.test.ts` → Consider Unit**

- **Why**: Performance tests could be isolated
- **Current**: Tests rendering performance
- **Could be**: Separate performance category

### Ambiguous Classifications:

**7. `FishController.test.ts` - UNCLEAR**

- **Current**: Mocks dependencies but tests controller coordination
- **Could be**: Either unit (mocked) or integration (real dependencies)

---

## 📋 **RECOMMENDED REORGANIZATION ACTIONS**

### IMMEDIATE (High Impact):

1. **Move mechanics tests to integration**:
   - `Feeding.test.ts` → `tests/integration/FeedingWorkflow.test.ts`
   - `Cleaning.test.ts` → `tests/integration/CleaningWorkflow.test.ts`
   - `Pollution.test.ts` → `tests/integration/PollutionSystem.test.ts`
   - `SellFish.test.ts` → `tests/integration/SellFishWorkflow.test.ts`

2. **Move mode tests to integration**:
   - `DeveloperMode.test.ts` → `tests/integration/DeveloperModeInit.test.ts`

### CREATE NEW Unit Tests:

3. **Extract pure logic for unit testing**:
   - Create `tests/unit/FeedingService.test.ts` - Pure feeding calculations
   - Create `tests/unit/CleaningService.test.ts` - Pure cleaning logic
   - Create `tests/unit/PollutionService.test.ts` - Pure pollution calculations

### MEDIUM PRIORITY:

4. **Clarify ambiguous tests**:
   - Decide if `FishController.test.ts` stays unit (with mocks) or moves to integration
   - Create separate `tests/perf/` category for performance tests

### NAMING CONVENTIONS:

5. **Establish clear naming**:
   - Unit: `[Component/Service].test.ts` (e.g., `FishService.test.ts`)
   - Integration: `[Workflow/Feature].test.ts` (e.g., `FeedingWorkflow.test.ts`)

---

## 🎯 **DECISION FRAMEWORK**

**Ask these questions to classify a test**:

1. **Does it use real store/state?** → Integration
2. **Does it test multiple components together?** → Integration
3. **Does it test user workflows end-to-end?** → Integration
4. **Does it render React components?** → Integration
5. **Does it only test pure functions/logic?** → Unit
6. **Does it mock ALL external dependencies?** → Unit
7. **Is it focused on a single class/function?** → Unit

---

## 📊 **EXPECTED OUTCOME**

**Before Reorganization**:

- Unit Tests: 23 files (some misclassified)
- Integration Tests: 8 files
- Unclear boundaries

**After Reorganization**:

- Unit Tests: ~18 files (pure logic only)
- Integration Tests: ~13 files (workflows + UI)
- Clear, predictable patterns
- Better test discoverability
- Faster unit test execution
- More comprehensive integration coverage

---

## 🔧 **IMPLEMENTATION STRATEGY**

1. **Phase 1**: Move obvious misclassifications (Feeding, Cleaning, Pollution, SellFish, DeveloperMode)
2. **Phase 2**: Extract pure logic into new unit tests
3. **Phase 3**: Update naming conventions
4. **Phase 4**: Add this guide to documentation
5. **Phase 5**: Establish CI/CD rules to prevent future misclassifications
