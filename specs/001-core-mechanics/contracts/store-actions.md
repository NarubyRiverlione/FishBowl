# API Contracts: Core Game Mechanics (MVP)

**Date**: 2025-11-19  
**Feature**: 001-core-mechanics  
**Format**: TypeScript interfaces (Store actions)

---

## Overview

The FishBowl MVP uses a **Zustand store** as the primary state management and "API" layer. All game actions are dispatched as store mutations. This document defines the contracts for those actions.

---

## 1. Game Initialization

### Action: `initializeGame(developerMode: boolean = false, tutorialEnabled: boolean = true)`

**Purpose**: Create a new game with starting state. Supports normal mode (tutorial with bowl) and developer mode (skip tutorial with standard tank).

**Preconditions**: None

**Input**:

```typescript
{
  developerMode: boolean // Default false. Set true via URL query param ?dev=true or debug button
  tutorialEnabled: boolean // Default true. Set false via URL query param ?tutorial=false or settings toggle
}
```

**Note**: If `developerMode = true`, then `tutorialEnabled` is forced to `false` (developer mode disables tutorials).

**Output** (Normal Mode - developerMode = false):

```typescript
{
  currentTick: 0,
  totalTime: 0,
  isPaused: false,
  maturityBonusAwarded: false,
  tutorialEnabled: true, // or false if ?tutorial=false
  tutorialEvents: [],
  tank: {
    id: UUID,
    size: "BOWL",
    capacity: 1,
    waterQuality: 90,
    pollution: 10,
    hasFilter: false,
    temperature: 24,
    fish: [],
    createdAt: Date.now()
  },
  credits: 50,
  storeInventory: [
    { id: "fish-guppy", type: "FISH", name: "Guppy", cost: 50, quantity: -1, species: "GUPPY" },
    { id: "fish-goldfish", type: "FISH", name: "Goldfish", cost: 100, quantity: -1, species: "GOLDFISH" },
    { id: "food-bulk", type: "FOOD", name: "Bulk Food", cost: 1, quantity: -1 },
    // Note: equipment-filter NOT shown for BOWL (hidden in UI)
    { id: "upgrade-tank", type: "UPGRADE", name: "Standard Tank", cost: 75, quantity: 1 }
  ],
  selectedFishId: null,
  gameStartedAt: Date.now()
}
```

**Output** (Developer Mode - developerMode = true):

```typescript
{
  currentTick: 0,
  totalTime: 0,
  isPaused: false,
  maturityBonusAwarded: true, // Skip bonus (already have big tank)
  tutorialEnabled: false, // Always disabled in dev mode
  tutorialEvents: [], // No tutorials tracked
  tank: {
    id: UUID,
    size: "STANDARD",
    capacity: 10,
    waterQuality: 90,
    pollution: 10,
    hasFilter: false,
    temperature: 24,
    fish: [],
    createdAt: Date.now()
  },
  credits: 100, // More starting credits
  storeInventory: [
    { id: "fish-guppy", type: "FISH", name: "Guppy", cost: 50, quantity: -1, species: "GUPPY" },
    { id: "fish-goldfish", type: "FISH", name: "Goldfish", cost: 100, quantity: -1, species: "GOLDFISH" },
    { id: "food-bulk", type: "FOOD", name: "Bulk Food", cost: 1, quantity: -1 },
    { id: "equipment-filter", type: "EQUIPMENT", name: "Water Filter", cost: 50, quantity: 1 }
    // Note: upgrade-tank removed (already have standard tank)
  ],
  selectedFishId: null,
  gameStartedAt: Date.now()
}
```

**Side Effects**:

- Resets all game state.
- Clears any existing fish or progress.

---

## 2. Game Loop Control

### Action: `tick()`

**Purpose**: Advance the simulation by one tick (1 second).

**Preconditions**: Game not paused

**Input**: None

**Logic Flow**:

1. Increment `currentTick` by 1.
2. **Pollution Accumulation**:
   - Calculate pollution from fish: `fishPollution = livingFishCount × 0.1`
   - Add fish pollution: `pollution += fishPollution`
   - Note: Feeding pollution is added when `feedTank()` is called
3. **Filter Effect** (if installed):
   - If `tank.hasFilter === true`: `pollution -= 0.5`
   - Clamp pollution to min 0
4. **Update Water Quality**:
   - `waterQuality = 100 - pollution` (clamped 0-100)
5. **For each living fish in tank**:
   - Increment `age` by 1
   - Increment `hunger` by `speciesHungerRate` (clamped to max 100)
   - If `hunger ≥ 80` and health > 0:
     - Decrement `health` by 1 (starvation damage)
   - If `waterQuality < 50` and health > 0:
     - Decrement `health` by 0.5 (pollution damage)
   - If `health ≤ 0`:
     - Set `isAlive = false`
6. **Maturity Bonus Check** (only in BOWL tank):
   - If `tank.size === 'BOWL'` and `maturityBonusAwarded === false`:
     - Check if any fish has `age ≥ 120` and `isAlive === true`
     - If found: `credits += 50` and `maturityBonusAwarded = true`
7. Remove all dead fish from tank.

**Output**: Updated `IGameState`

**Example**:

```typescript
// Before tick (T=0, 2 fish, no filter)
{
  currentTick: 0,
  tank: {
    pollution: 10,
    waterQuality: 90,
    hasFilter: false,
    fish: [
      { id: "f1", age: 0, hunger: 0, health: 80, isAlive: true },
      { id: "f2", age: 0, hunger: 0, health: 80, isAlive: true }
    ]
  }
}

// After tick (T=1)
{
  currentTick: 1,
  tank: {
    pollution: 10.2, // +0.1 per fish (2 × 0.1)
    waterQuality: 89.8, // 100 - 10.2
    hasFilter: false,
    fish: [
      { id: "f1", age: 1, hunger: 1, health: 80, isAlive: true },
      { id: "f2", age: 1, hunger: 1, health: 80, isAlive: true }
    ]
  }
}

// After tick at T=80 with high pollution
{
  currentTick: 80,
  tank: {
    pollution: 55, // Accumulated over time
    waterQuality: 45, // Below threshold!
    hasFilter: false,
    fish: [
      { id: "f1", age: 80, hunger: 80, health: 77.5, isAlive: true }, // -1 starvation, -0.5 pollution per tick
      { id: "f2", age: 80, hunger: 80, health: 77.5, isAlive: true }
    ]
  }
}
```

**Error Cases**:

- None (tick is always valid)

---

### Action: `togglePause()`

**Purpose**: Pause or resume the game loop.

**Preconditions**: None

**Input**: None

**Behavior**:

- `isPaused = !isPaused`
- When paused, `tick()` is not called by the game loop timer.

**Output**: Updated `isPaused` flag

---

## 3. Fish Purchase

### Action: `buyFish(storeItemId: string)`

**Purpose**: Purchase a fish from the store and add it to the tank.

**Preconditions**:

- `credits ≥ item.cost`
- `tank.fish.length < tank.capacity`
- Store item exists and type is "FISH"

**Input**:

```typescript
{
  storeItemId: 'fish-guppy' // ID from storeInventory
}
```

**Logic**:

1. Find store item by ID.
2. Validate preconditions (credits, capacity, item exists).
3. Deduct `item.cost` from `credits`.
4. Create new `IFish`:
   ```typescript
   {
     id: generateUUID(),
     species: item.species,
     name: `${item.species}-${timestamp}`,
     color: randomHexColor(),
     size: getSpeciesMinSize(species),
     age: 0,
     health: 80,
     hunger: 0,
     isAlive: true,
     genetics: {},
     createdAt: Date.now(),
     lastFedAt: Date.now()
   }
   ```
5. Add fish to `tank.fish`.

**Output**: Updated `IGameState` with fish added and credits deducted

**Error Cases**:

- **Insufficient credits**: Reject with error "Not enough credits".
- **Tank full**: Reject with error "Tank at capacity".
- **Invalid item**: Reject with error "Store item not found".

**Example**:

```typescript
// Before
{ credits: 100, tank: { fish: [] } }

// Action: buyFish("fish-guppy")
// After
{ credits: 50, tank: { fish: [{ id: "uuid", species: "GUPPY", age: 0, ... }] } }
```

---

## 4. Feeding

### Action: `feedTank()`

**Purpose**: Feed all living fish in the tank to reduce their hunger.

**Preconditions**:

- At least one living fish in tank.
- `credits ≥ feedCost` where `feedCost = BASE_FEED_COST + (PER_FISH_COST × livingFishCount)`

**Constants**:

- `BASE_FEED_COST = 2` (flat fee for feeding action)
- `PER_FISH_COST = 1` (cost per living fish)
- `HUNGER_REDUCTION = 30` (amount hunger decreases, clamped to 0)
- `POLLUTION_FROM_FEEDING = 2` (pollution added per feeding action)

**Input**: None (feeds entire tank)

**Logic**:

1. Count living fish: `livingFishCount = tank.fish.filter(f => f.isAlive).length`
2. Calculate cost: `feedCost = 2 + (1 × livingFishCount)`
3. Validate preconditions (livingFishCount > 0, credits ≥ feedCost)
4. Deduct `feedCost` from `credits`
5. Increase pollution: `pollution += 2` (feeding adds waste to tank)
6. Update water quality: `waterQuality = 100 - pollution` (clamped 0-100)
7. For each living fish:
   - Reduce `hunger = Math.max(0, hunger - 30)`
   - Update `lastFedAt = Date.now()`

**Output**: Updated `IGameState` with all living fish hunger reduced and credits deducted

**Error Cases**:

- **No living fish**: Reject with error "No living fish to feed".
- **Insufficient credits**: Reject with error "Not enough credits. Need X credits to feed Y fish".

**Examples**:

```typescript
// Example 1: Single fish
// Before
{ credits: 50, tank: { fish: [{ id: "f1", hunger: 60, isAlive: true }] } }

// Cost = 2 + (1 × 1) = 3 credits
// Action: feedTank()
// After
{ credits: 47, tank: { fish: [{ id: "f1", hunger: 30, isAlive: true }] } }

// Example 2: Multiple fish
// Before
{ credits: 50, tank: { fish: [
  { id: "f1", hunger: 80, isAlive: true },
  { id: "f2", hunger: 95, isAlive: true },
  { id: "f3", hunger: 50, isAlive: false } // Dead fish not fed
] } }

// Cost = 2 + (1 × 2) = 4 credits (only 2 living fish)
// Action: feedTank()
// After
{ credits: 46, tank: { fish: [
  { id: "f1", hunger: 50, isAlive: true },
  { id: "f2", hunger: 65, isAlive: true },
  { id: "f3", hunger: 50, isAlive: false } // Unchanged
] } }

// Example 3: Hunger clamped to 0
// Before
{ credits: 10, tank: { fish: [{ id: "f1", hunger: 20, isAlive: true }] } }

// Action: feedTank()
// After
{ credits: 7, tank: { fish: [{ id: "f1", hunger: 0, isAlive: true }] } }
```

---

## 5. Tank Cleaning

### Action: `cleanTank()`

**Purpose**: Manually clean the tank to reduce pollution.

**Preconditions**:

- `credits ≥ 10`

**Constants**:

- `CLEAN_COST = 10` (credits)
- `POLLUTION_REDUCTION = 30` (pollution points removed)

**Input**: None

**Logic**:

1. Validate preconditions (credits ≥ 10)
2. Deduct 10 credits from `credits`
3. Reduce pollution: `pollution = Math.max(0, pollution - 30)`
4. Update water quality: `waterQuality = 100 - pollution`

**Output**: Updated `IGameState` with reduced pollution and credits deducted

**Error Cases**:

- **Insufficient credits**: Reject with error "Not enough credits. Need 10 credits to clean tank".

**Examples**:

```typescript
// Example 1: High pollution
// Before
{ credits: 50, tank: { pollution: 60, waterQuality: 40 } }

// Action: cleanTank()
// After
{ credits: 40, tank: { pollution: 30, waterQuality: 70 } }

// Example 2: Low pollution (clamped to 0)
// Before
{ credits: 20, tank: { pollution: 15, waterQuality: 85 } }

// Action: cleanTank()
// After
{ credits: 10, tank: { pollution: 0, waterQuality: 100 } }
```

---

## 6. Filter Purchase

### Action: `buyFilter()`

**Purpose**: Install a water filter to automatically reduce pollution over time.

**Preconditions**:

- `credits ≥ 50`
- `tank.hasFilter === false` (only one filter allowed)
- `tank.size === 'STANDARD'` (BOWL tanks cannot have filters)

**Constants**:

- `FILTER_COST = 50` (credits)
- `FILTER_REDUCTION_RATE = 0.5` (pollution reduced per tick)

**Input**: None

**Logic**:

1. Validate preconditions (credits ≥ 50, no existing filter, tank is STANDARD)
2. Deduct 50 credits from `credits`
3. Set `tank.hasFilter = true`

**Output**: Updated `IGameState` with filter installed and credits deducted

**Side Effects**:

- On every game tick, pollution will decrease by 0.5 (applied in game loop, not this action)

**Error Cases**:

- **Insufficient credits**: Reject with error "Not enough credits. Need 50 credits for filter".
- **Filter already installed**: Reject with error "Tank already has a filter installed".
- **Tank is BOWL**: Reject with error "Cannot install filter in Small Bowl. Upgrade to Standard Tank first".

**Example**:

```typescript
// Before
{ credits: 100, tank: { pollution: 40, waterQuality: 60, hasFilter: false } }

// Action: buyFilter()
// After
{ credits: 50, tank: { pollution: 40, waterQuality: 60, hasFilter: true } }

// On subsequent ticks:
// Tick 1: pollution = 39.5, waterQuality = 60.5
// Tick 2: pollution = 39.0, waterQuality = 61.0
// ... (assuming no new pollution sources)
```

---

## 7. Tank Upgrade

### Action: `upgradeTank()`

**Purpose**: Upgrade from Small Bowl (capacity 1) to Standard Tank (capacity 10).

**Preconditions**:

- `credits ≥ 75`
- `tank.size === 'BOWL'` (can only upgrade once)

**Constants**:

- `TANK_UPGRADE_COST = 75` (credits)

**Input**: None

**Logic**:

1. Validate preconditions (credits ≥ 75, tank is BOWL)
2. Deduct 75 credits from `credits`
3. Set `tank.size = 'STANDARD'`
4. Set `tank.capacity = 10`

**Output**: Updated `IGameState` with upgraded tank and credits deducted

**Side Effects**:

- Unlocks breeding mechanics (can now have multiple fish)
- Allows purchasing more fish (up to 10 total)

**Error Cases**:

- **Insufficient credits**: Reject with error "Not enough credits. Need 75 credits for tank upgrade".
- **Already upgraded**: Reject with error "Tank is already Standard size".

**Example**:

```typescript
// Before
{
  credits: 100,
  tank: { size: "BOWL", capacity: 1, fish: [{ id: "f1", age: 150, isAlive: true }] }
}

// Action: upgradeTank()
// After
{
  credits: 25,
  tank: { size: "STANDARD", capacity: 10, fish: [{ id: "f1", age: 150, isAlive: true }] }
}
// Now player can buy up to 9 more fish
```

---

## 8. Selling Fish

### Action: `sellFish(fishId: string)`

**Purpose**: Sell a fish and receive credits based on value calculation.

**Preconditions**:

- Fish exists (alive or dead)

**Input**:

```typescript
{
  fishId: '550e8400-e29b-41d4-a716-446655440000' // UUID of fish
}
```

**Logic**:

1. Find fish by ID.
2. Calculate value:
   ```
   if (isAlive && health > 0):
     ageMultiplier = min(1 + (age / 300), 2.0)
     healthModifier = health / 100
     value = baseValue × ageMultiplier × healthModifier
   else:
     value = 0
   ```
3. Add value to `credits`.
4. Remove fish from `tank.fish`.

**Output**: Updated `IGameState` with fish removed and credits added

**Error Cases**:

- **Fish not found**: Reject with error "Fish not found".

**Example**:

```typescript
// Before (Guppy at age 120, health 90)
{ credits: 50, fish: { id: "f1", species: "GUPPY", age: 120, health: 90 } }

// Value = 50 × (1 + 120/300) × (90/100) = 50 × 1.4 × 0.9 = 63
// Action: sellFish("f1")
// After
{ credits: 113, tank: { fish: [] } }
```

---

## 9. Tutorial Management

### Action: `showTutorial(eventId: string)`

**Purpose**: Trigger a tutorial popup for a specific game event (if tutorial enabled and not already shown).

**Preconditions**:

- `tutorialEnabled === true`
- `eventId` not in `tutorialEvents` array (prevent duplicate popups)

**Input**:

```typescript
{
  eventId: 'first_buy' |
    'first_feed' |
    'hunger_warning' |
    'low_water_quality' |
    'fish_death' |
    'maturity_bonus' |
    'tank_upgrade'
}
```

**Tutorial Content Map**:

- `"first_buy"`: "Welcome to FishBowl! You've bought your first fish. Keep it healthy by feeding regularly and maintaining water quality."
- `"first_feed"`: "Good job feeding! Monitor your fish's hunger (turns red at 80+). Feeding costs credits and increases pollution."
- `"hunger_warning"`: "Warning! Your fish is very hungry (80+). Feed soon or it will lose health. Starving fish can die!"
- `"low_water_quality"`: "Water quality is low (<50)! Dirty water damages fish health. Clean the tank (10 credits) to improve it."
- `"fish_death"`: "Your fish died! Common causes: starvation (hunger 80+) or bad water quality (<50). Try again!"
- `"maturity_bonus"`: "Congratulations! Your fish reached maturity (2 min). You earned 50 bonus credits! Save up to upgrade your tank (75 credits)."
- `"tank_upgrade"`: "Tank upgraded! You can now have up to 10 fish and unlock breeding. Water filters are now available in the store."

**Logic**:

1. Check if `tutorialEnabled === true` and `eventId` not in `tutorialEvents`
2. If both conditions met:
   - Add `eventId` to `tutorialEvents` array
   - Return tutorial popup data for UI to display
3. Otherwise: No-op (return null)

**UI Behavior**:

- Popup displays as modal overlay (blocks game interaction)
- User must click "OK" or "X" button to dismiss (no auto-hide timer)
- Game loop continues running while popup is visible (hunger/pollution still accumulate)

**Output**: Tutorial popup data or null

**Example**:

```typescript
// Before (first fish purchase)
{ tutorialEnabled: true, tutorialEvents: [] }

// Action: showTutorial("first_buy")
// After
{ tutorialEnabled: true, tutorialEvents: ["first_buy"] }
// UI displays: "Welcome to FishBowl! You've bought your first fish..."

// Action: showTutorial("first_buy") again
// Result: null (already shown, no duplicate popup)
```

### Action: `toggleTutorial(enabled: boolean)`

**Purpose**: Enable or disable tutorial popups (can be toggled from settings UI).

**Preconditions**: None

**Input**:

```typescript
{
  enabled: boolean
}
```

**Logic**:

1. Set `tutorialEnabled = enabled`

**Output**: Updated `IGameState`

**Note**: Toggling off tutorial does NOT clear `tutorialEvents` array (history preserved if re-enabled).

---

## 10. Fish Selection (UI Helper)

### Action: `selectFish(fishId: string | null)`

**Purpose**: Select or deselect a fish for UI interaction.

**Preconditions**: None

**Input**:

```typescript
{
  fishId: '550e8400-e29b-41d4-a716-446655440000' // UUID or null to deselect
}
```

**Logic**:

1. Set `selectedFishId = fishId`.

**Output**: Updated `IGameState` with new selection

**Error Cases**: None (deselection always valid)

---

## 7. Query/Selector Contracts

These are **read-only selectors** (Zustand hooks) for UI components to access state without unnecessary re-renders.

### Selector: `selectGameState(state: IGameState)`

```typescript
// Returns: Full game state
return state
```

### Selector: `selectCredits(state: IGameState)`

```typescript
// Returns: Current credits balance
return state.credits
```

### Selector: `selectTankFish(state: IGameState)`

```typescript
// Returns: All living fish in tank
return state.tank.fish.filter((f) => f.isAlive)
```

### Selector: `selectSelectedFish(state: IGameState)`

```typescript
// Returns: Currently selected fish or null
if (state.selectedFishId) {
  return state.tank.fish.find((f) => f.id === state.selectedFishId)
}
return null
```

### Selector: `selectStoreInventory(state: IGameState)`

```typescript
// Returns: Store items
return state.storeInventory
```

---

## 8. Event Logging (Optional, Future)

For debugging and analytics, actions could emit events:

```typescript
type GameEvent =
  | { type: 'FISH_PURCHASED'; fishId: string; species: FishSpecies; cost: number }
  | { type: 'FISH_FED'; fishId: string; cost: number }
  | { type: 'FISH_SOLD'; fishId: string; value: number }
  | { type: 'FISH_DIED'; fishId: string; cause: 'STARVATION' | 'OTHER' }
  | { type: 'GAME_INITIALIZED' }
  | { type: 'TICK' }
  | { type: 'GAME_OVER' }
```

MVP: Optional (no event logging required).

---

## 9. Error Handling

All actions return a **Result type** for error handling:

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: string }

// Example usage
const result = store.feedFish('f1')
if (!result.success) {
  console.error(result.error) // "Not enough credits"
}
```

---

## 10. Store Hook Example

```typescript
// Zustand store definition
export const useGameStore = create<IGameState & {
  tick: () => void;
  buyFish: (storeItemId: string) => Result<void>;
  feedFish: (fishId: string) => Result<void>;
  sellFish: (fishId: string) => Result<void>;
  selectFish: (fishId: string | null) => void;
  togglePause: () => void;
  initializeGame: () => void;
}>((set, get) => ({
  // ... state
  tick: () => { /* logic */ },
  buyFish: (storeItemId) => { /* logic */ },
  feedFish: (fishId) => { /* logic */ },
  sellFish: (fishId) => { /* logic */ },
  selectFish: (fishId) => { /* logic */ },
  togglePause: () => { /* logic */ },
  initializeGame: () => { /* logic */ },
}));

// Usage in React component
export function GameHUD() {
  const credits = useGameStore(state => state.credits);
  const fish = useGameStore(state => state.tank.fish);
  const feedFish = useGameStore(state => state.feedFish);

  return (
    <div>
      <p>Credits: {credits}</p>
      <p>Fish: {fish.length}</p>
      <button onClick={() => feedFish("f1")}>Feed</button>
    </div>
  );
}
```

---

## Summary

| Action               | Input           | Output             | Errors                            |
| -------------------- | --------------- | ------------------ | --------------------------------- |
| `initializeGame()`   | -               | Full game state    | -                                 |
| `tick()`             | -               | Updated game state | -                                 |
| `buyFish(itemId)`    | Store item ID   | Updated state      | Credits, capacity, item not found |
| `feedFish(fishId)`   | Fish ID         | Updated state      | Fish not found, dead, no credits  |
| `sellFish(fishId)`   | Fish ID         | Updated state      | Fish not found                    |
| `selectFish(fishId)` | Fish ID or null | Updated state      | -                                 |
| `togglePause()`      | -               | Updated pause flag | -                                 |

---

## Next Steps

1. Implement types in `src/types/index.ts`.
2. Implement store actions in `src/store/useGameStore.ts`.
3. Write tests for each action in `tests/store.test.ts`.
